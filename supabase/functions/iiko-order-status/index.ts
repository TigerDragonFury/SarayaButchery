// iiko Order Status - Public endpoint for customer order tracking
// Fetches current status from iiko POS for a specific order
// No auth required - uses order number for lookup (customer-facing)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// iiko Configuration
const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  baseUrl: "https://api-eu.iiko.services",
};

// Status mapping: iiko status → website status
const IIKO_STATUS_MAP: Record<string, string> = {
  'Unconfirmed': 'pending',
  'WaitCooking': 'pending',
  'ReadyForCooking': 'confirmed',
  'Accepted': 'confirmed',
  'CookingStarted': 'preparing',
  'Cooking': 'preparing',
  'CookingCompleted': 'ready',
  'Ready': 'ready',
  'Waiting': 'ready',
  'OnWay': 'out_for_delivery',
  'On the way': 'out_for_delivery',
  'Delivered': 'delivered',
  'Closed': 'delivered',
  'Cancelled': 'cancelled',
};

// Get iiko access token
async function getIikoToken(apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) {
      console.error('[iiko-order-status] Token failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error('[iiko-order-status] Token error:', err);
    return null;
  }
}

// Fetch order status from iiko by order ID
async function fetchOrderStatusFromIiko(token: string, iikoOrderId: string): Promise<string | null> {
  try {
    console.log(`[iiko-order-status] Fetching status for: ${iikoOrderId}`);

    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        organizationId: IIKO_CONFIG.organizationId,
        orderIds: [iikoOrderId],
      }),
    });

    if (!response.ok) {
      console.error('[iiko-order-status] Order fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    const order = data.orders?.[0];
    
    if (!order) {
      console.log('[iiko-order-status] Order not found in iiko');
      return null;
    }

    return order.status;
  } catch (err) {
    console.error('[iiko-order-status] Fetch error:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] iiko Order Status check`);

  try {
    const apiKey = Deno.env.get('IIKO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'iiko not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const orderNumber = url.searchParams.get('order_number');

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'order_number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`[iiko-order-status] Looking up order: ${orderNumber}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find order by order_number OR iiko_order_number
    let orderData: any = null;
    
    // Try by iiko_order_number first (official POS number)
    const { data: byIikoNumber } = await supabase
      .from('orders')
      .select('id, order_number, iiko_order_id, iiko_order_number, status')
      .eq('iiko_order_number', orderNumber)
      .maybeSingle();

    if (byIikoNumber) {
      orderData = byIikoNumber;
    } else {
      // Try by internal order_number
      const { data: byOrderNumber } = await supabase
        .from('orders')
        .select('id, order_number, iiko_order_id, iiko_order_number, status')
        .eq('order_number', orderNumber)
        .maybeSingle();
      
      orderData = byOrderNumber;
    }

    if (!orderData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no iiko_order_id, return current status without syncing
    if (!orderData.iiko_order_id) {
      logs.push('[iiko-order-status] Order not synced with iiko');
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: orderData.status,
          iikoSynced: false,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get iiko token and fetch current status
    const token = await getIikoToken(apiKey);
    if (!token) {
      // Return cached status if iiko unavailable
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: orderData.status,
          iikoSynced: true,
          fromCache: true,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const iikoStatus = await fetchOrderStatusFromIiko(token, orderData.iiko_order_id);
    
    if (!iikoStatus) {
      // Return cached status if iiko order not found
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: orderData.status,
          iikoSynced: true,
          fromCache: true,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteStatus = IIKO_STATUS_MAP[iikoStatus];
    
    if (!websiteStatus) {
      logs.push(`[iiko-order-status] Unknown iiko status: ${iikoStatus}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: orderData.status,
          iikoStatus,
          iikoSynced: true,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update if status changed
    if (orderData.status !== websiteStatus) {
      logs.push(`[iiko-order-status] Status changed: ${orderData.status} → ${websiteStatus}`);
      
      const updateData: Record<string, any> = {
        status: websiteStatus,
        updated_at: new Date().toISOString(),
      };
      
      if (websiteStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderData.id);

      if (!updateError) {
        // Add order update record
        await supabase.from('order_updates').insert({
          order_id: orderData.id,
          status: websiteStatus,
          notes: `Auto-synced from iiko: ${iikoStatus}`,
        });

        logs.push('[iiko-order-status] ✓ Status updated');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: websiteStatus,
        iikoStatus,
        iikoSynced: true,
        updated: orderData.status !== websiteStatus,
        logs 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[iiko-order-status] Error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        logs 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
