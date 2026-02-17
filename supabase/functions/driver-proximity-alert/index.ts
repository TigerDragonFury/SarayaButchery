// Edge function to check driver proximity and send push notification
// SECURED: Requires authenticated driver or admin

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Authenticate driver or admin
async function authenticateDriverOrAdmin(req: Request): Promise<{ userId: string; isDriver: boolean; isAdmin: boolean } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const isAdmin = roles?.some(r => r.role === 'admin') || false;
  const isDriver = roles?.some(r => r.role === 'driver') || false;

  return { userId: user.id, isDriver, isAdmin };
}

// Calculate distance between two coordinates in meters using Haversine formula
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface ProximityPayload {
  orderId: string;
  driverLat: number;
  driverLng: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // AUTHENTICATION CHECK
    const auth = await authenticateDriverOrAdmin(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!auth.isDriver && !auth.isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - requires driver or admin role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: ProximityPayload = await req.json();
    const { orderId, driverLat, driverLng } = payload;

    // Validate input
    if (!orderId || typeof driverLat !== 'number' || typeof driverLng !== 'number') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input: orderId, driverLat, and driverLng are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking proximity for order ${orderId}`, { driverLat, driverLng });

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_id, delivery_address, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.status !== 'out_for_delivery') {
      return new Response(
        JSON.stringify({ success: true, message: 'Order not in delivery status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already sent
    const { data: existingAlert } = await supabase
      .from('notifications')
      .select('id')
      .eq('order_id', orderId)
      .eq('type', 'proximity_alert')
      .limit(1);

    if (existingAlert && existingAlert.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Alert already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deliveryLat = 24.4988;
    const deliveryLng = 54.4055;

    const distance = calculateDistance(driverLat, driverLng, deliveryLat, deliveryLng);
    console.log(`Distance to delivery: ${distance.toFixed(0)} meters`);

    const PROXIMITY_THRESHOLD = 500;

    if (distance <= PROXIMITY_THRESHOLD) {
      console.log(`🚗 Driver is within ${PROXIMITY_THRESHOLD}m! Sending notification...`);

      await supabase.from('notifications').insert({
        order_id: orderId,
        user_id: order.customer_id,
        type: 'proximity_alert',
        channel: 'push',
        content: JSON.stringify({
          titleAr: '🚗 السائق على وشك الوصول!',
          titleEn: '🚗 Driver is almost there!',
          bodyAr: `السائق على بُعد ${Math.round(distance)} متر من موقعك. استعد لاستلام طلبك!`,
          bodyEn: `Driver is ${Math.round(distance)}m away from your location. Get ready to receive your order!`,
          orderNumber: order.order_number,
          distance: Math.round(distance),
        }),
        sent: true,
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          proximityAlert: true,
          distance: Math.round(distance),
          message: `Driver within ${PROXIMITY_THRESHOLD}m - notification sent` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        proximityAlert: false,
        distance: Math.round(distance),
        message: `Driver is ${Math.round(distance)}m away (threshold: ${PROXIMITY_THRESHOLD}m)` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proximity check error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
