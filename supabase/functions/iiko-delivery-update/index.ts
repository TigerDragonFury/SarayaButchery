// iiko Delivery Status Update - Edge Function
// Syncs driver status changes TO iiko (website → iiko)
// Prevents double updates with idempotency checks
// SECURED: Requires admin or driver authentication

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  baseUrl: "https://api-eu.iiko.services",
};

// Website status → iiko status mapping
const STATUS_TO_IIKO: Record<string, string> = {
  'out_for_delivery': 'OnWay',
  'delivered': 'Closed',
};

// Valid order statuses
const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Authenticate request and check role
async function authenticateRequest(req: Request): Promise<{ userId: string; isAdmin: boolean; isDriver: boolean } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  const userId = user.id;

  // Check user roles using service role
  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  const isAdmin = roles?.some(r => r.role === 'admin') || false;
  const isDriver = roles?.some(r => r.role === 'driver') || false;

  return { userId, isAdmin, isDriver };
}

// Validate input
function validateInput(body: any): { valid: boolean; error?: string } {
  if (!body.orderId) {
    return { valid: false, error: 'orderId is required' };
  }
  if (!UUID_REGEX.test(body.orderId)) {
    return { valid: false, error: 'orderId must be a valid UUID' };
  }
  if (!body.newStatus) {
    return { valid: false, error: 'newStatus is required' };
  }
  if (!VALID_STATUSES.includes(body.newStatus)) {
    return { valid: false, error: `newStatus must be one of: ${VALID_STATUSES.join(', ')}` };
  }
  if (body.driverAction && typeof body.driverAction !== 'string') {
    return { valid: false, error: 'driverAction must be a string' };
  }
  if (body.driverAction && body.driverAction.length > 200) {
    return { valid: false, error: 'driverAction must be less than 200 characters' };
  }
  return { valid: true };
}

// Get iiko access token
async function getIikoToken(apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.token;
  } catch {
    return null;
  }
}

// Update order status in iiko
async function updateIikoOrderStatus(
  token: string, 
  iikoOrderId: string, 
  newStatus: string,
  logs: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    logs.push(`[iiko-delivery] Updating iiko order ${iikoOrderId} to ${newStatus}`);

    if (newStatus === 'OnWay') {
      const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/confirm`, {
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
        const errorText = await response.text();
        logs.push(`[iiko-delivery] Confirm failed: ${response.status} - ${errorText}`);
        
        const onWayResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/change_delivery_status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationId: IIKO_CONFIG.organizationId,
            orderId: iikoOrderId,
            deliveryStatus: 'OnWay',
          }),
        });
        
        if (!onWayResponse.ok) {
          const onWayError = await onWayResponse.text();
          logs.push(`[iiko-delivery] Change status also failed: ${onWayError}`);
          return { success: false, error: 'Failed to update iiko status' };
        }
      }
      
      logs.push('[iiko-delivery] ✓ Order marked as On Way in iiko');
      return { success: true };
    }
    
    if (newStatus === 'Closed') {
      const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: IIKO_CONFIG.organizationId,
          orderId: iikoOrderId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logs.push(`[iiko-delivery] Close failed: ${response.status} - ${errorText}`);
        return { success: false, error: 'Failed to close order in iiko' };
      }
      
      logs.push('[iiko-delivery] ✓ Order closed in iiko');
      return { success: true };
    }

    logs.push(`[iiko-delivery] Unknown status: ${newStatus}`);
    return { success: false, error: `Unknown status: ${newStatus}` };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    logs.push(`[iiko-delivery] Error: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] iiko Delivery Update triggered`);

  try {
    // AUTHENTICATION CHECK
    const auth = await authenticateRequest(req);
    if (!auth) {
      logs.push('[iiko-delivery] Unauthorized - no valid auth token');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only admins and drivers can update delivery status
    if (!auth.isAdmin && !auth.isDriver) {
      logs.push('[iiko-delivery] Forbidden - user is not admin or driver');
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - requires admin or driver role', logs }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`[iiko-delivery] Authenticated user: ${auth.userId} (admin: ${auth.isAdmin}, driver: ${auth.isDriver})`);

    const apiKey = Deno.env.get('IIKO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'IIKO_API_KEY not configured', logs }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // INPUT VALIDATION
    const validation = validateInput(body);
    if (!validation.valid) {
      logs.push(`[iiko-delivery] Validation error: ${validation.error}`);
      return new Response(
        JSON.stringify({ success: false, error: validation.error, logs }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId, newStatus, driverAction } = body;
    logs.push(`[iiko-delivery] Order: ${orderId}, Status: ${newStatus}, Action: ${driverAction}`);

    // Validate status is supported for iiko sync
    const iikoStatus = STATUS_TO_IIKO[newStatus];
    if (!iikoStatus) {
      logs.push(`[iiko-delivery] Status ${newStatus} not mapped to iiko`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Status not synced to iiko', logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order with iiko_order_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, iiko_order_id, iiko_synced, driver_id')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      logs.push(`[iiko-delivery] Order not found: ${orderId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found', logs }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If user is driver, verify they're assigned to this order
    if (auth.isDriver && !auth.isAdmin) {
      const { data: driverRecord } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', auth.userId)
        .single();

      if (!driverRecord || order.driver_id !== driverRecord.id) {
        logs.push('[iiko-delivery] Driver not assigned to this order');
        return new Response(
          JSON.stringify({ success: false, error: 'You are not assigned to this order', logs }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if order has iiko_order_id
    if (!order.iiko_order_id) {
      logs.push('[iiko-delivery] Order not synced to iiko (no iiko_order_id)');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Order not in iiko', logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // IDEMPOTENCY CHECK
    const { data: existingUpdate } = await supabase
      .from('order_updates')
      .select('id')
      .eq('order_id', order.id)
      .eq('status', newStatus)
      .ilike('notes', '%→ iiko%')
      .maybeSingle();

    if (existingUpdate) {
      logs.push('[iiko-delivery] ⚠️ Update already synced to iiko (idempotency check)');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Already synced', logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get iiko token
    const token = await getIikoToken(apiKey);
    if (!token) {
      logs.push('[iiko-delivery] Failed to get iiko token');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to authenticate with iiko', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update iiko order status
    const result = await updateIikoOrderStatus(token, order.iiko_order_id, iikoStatus, logs);

    if (result.success) {
      await supabase.from('order_updates').insert({
        order_id: order.id,
        status: newStatus,
        notes: `Driver: ${driverAction || newStatus} → iiko: ${iikoStatus}`,
        updated_by: auth.userId,
      });

      if (newStatus === 'delivered') {
        await supabase
          .from('orders')
          .update({ delivered_at: new Date().toISOString() })
          .eq('id', order.id);
      }

      logs.push('[iiko-delivery] ✓ Sync complete');
    }

    return new Response(
      JSON.stringify({ 
        success: result.success,
        iikoStatus,
        orderNumber: order.order_number,
        error: result.error,
        logs 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[iiko-delivery] Error:', err);
    logs.push(`[iiko-delivery] ERROR: ${err instanceof Error ? err.message : 'Unknown'}`);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error', logs }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
