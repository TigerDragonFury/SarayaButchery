// Driver Delivery Reminder - sends reminders for upcoming scheduled deliveries
// SECURED: Requires admin authentication or service role key (for cron/scheduler)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Authenticate: accept service role key (cron) or admin user
async function authenticateCaller(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Allow internal calls using service role key
  if (serviceRoleKey && token === serviceRoleKey) return true;

  // Otherwise validate as admin user
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const supabaseService = createClient(supabaseUrl, serviceRoleKey!);
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin');

  return (roles?.length || 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // AUTHENTICATION CHECK
    const isAuthorized = await authenticateCaller(req);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const in60min = new Date(now.getTime() + 60 * 60 * 1000);
    const in75min = new Date(now.getTime() + 75 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, delivery_address, scheduled_date, scheduled_time_slot, driver_id')
      .eq('scheduled_date', todayStr)
      .not('driver_id', 'is', null)
      .in('status', ['confirmed', 'preparing', 'ready']);

    if (error) {
      console.error('Error fetching orders:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let reminded = 0;

    for (const order of orders || []) {
      if (!order.scheduled_time_slot) continue;

      const slotMatch = order.scheduled_time_slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!slotMatch) continue;

      let hours = parseInt(slotMatch[1]);
      const minutes = parseInt(slotMatch[2]);
      const ampm = slotMatch[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const slotTime = new Date(`${order.scheduled_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

      if (slotTime > in60min && slotTime <= in75min) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', 'driver_reminder')
          .maybeSingle();

        if (existing) continue;

        const { data: driver } = await supabase
          .from('drivers')
          .select('user_id')
          .eq('id', order.driver_id)
          .maybeSingle();

        if (!driver?.user_id) continue;

        // Call push-notification with service role key for internal auth
        const pushResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/push-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              userId: driver.user_id,
              orderId: order.id,
              orderNumber: order.order_number,
              title: 'Delivery Reminder',
              titleAr: 'تذكير بالتوصيل ⏰',
              body: `Order ${order.order_number} is scheduled for ${order.scheduled_time_slot}`,
              bodyAr: `الطلب ${order.order_number} مجدول في ${order.scheduled_time_slot} - ${order.customer_name}`,
              data: {
                orderId: order.id,
                orderNumber: order.order_number,
                route: '/driver',
              },
            }),
          }
        );

        const pushResult = await pushResponse.json();
        console.log('Reminder sent for order:', order.order_number, pushResult);

        await supabase.from('notifications').insert({
          order_id: order.id,
          user_id: driver.user_id,
          type: 'driver_reminder',
          channel: 'fcm',
          content: JSON.stringify({
            title: 'تذكير بالتوصيل',
            body: `الطلب ${order.order_number} مجدول في ${order.scheduled_time_slot}`,
          }),
          sent: pushResult.success,
          sent_at: pushResult.success ? new Date().toISOString() : null,
        });

        reminded++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminded, checked: orders?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Driver reminder error:', error);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
