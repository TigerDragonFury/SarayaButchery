// iiko Order Status Sync - Edge Function
// Supports polling and webhook-ready structure
// SECURED: Requires admin authentication for poll/sync actions
// Webhook mode uses signature verification

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-iiko-signature, x-iiko-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// iiko Configuration
const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  terminalId: "c7d35f12-dd03-c268-0173-09bb2e4900ce",
  baseUrl: "https://api-eu.iiko.services",
  webhookEnabled: false,
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Authenticate admin request
async function authenticateAdmin(req: Request): Promise<{ userId: string; isAdmin: boolean } | null> {
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
  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');

  const isAdmin = (roles?.length || 0) > 0;

  return { userId, isAdmin };
}

// HMAC signature verification using Web Crypto API
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return signature.toLowerCase() === expectedSignature.toLowerCase();
  } catch {
    return false;
  }
}

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

interface IikoOrderStatus {
  orderId: string;
  status: string;
  timestamp?: string;
}

interface WebhookPayload {
  eventType: 'OrderStatusChanged' | 'OrderCancelled' | 'DeliveryStatusChanged';
  organizationId: string;
  orderId: string;
  orderNumber?: string;
  status: string;
  timestamp: string;
  cancellationReason?: string;
}

// Get iiko access token
async function getIikoToken(apiKey: string): Promise<string | null> {
  try {
    console.log('[iiko-sync] Requesting access token...');
    
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) {
      console.error('[iiko-sync] Token failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error('[iiko-sync] Token error:', err);
    return null;
  }
}

// Fetch order status from iiko by order ID
async function fetchOrderStatus(token: string, iikoOrderId: string): Promise<IikoOrderStatus | null> {
  try {
    console.log(`[iiko-sync] Fetching status for order: ${iikoOrderId}`);

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
      console.error('[iiko-sync] Order fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    const order = data.orders?.[0];
    
    if (!order) {
      console.log('[iiko-sync] Order not found in iiko');
      return null;
    }

    return {
      orderId: order.id,
      status: order.status,
      timestamp: order.statusChangeDateTime || new Date().toISOString(),
    };
  } catch (err) {
    console.error('[iiko-sync] Fetch error:', err);
    return null;
  }
}

// Update order status in Supabase
async function updateOrderStatus(
  supabase: any,
  iikoOrderId: string,
  iikoStatus: string,
  logs: string[]
): Promise<{ success: boolean; orderNumber?: string; newStatus?: string }> {
  const websiteStatus = IIKO_STATUS_MAP[iikoStatus];
  
  if (!websiteStatus) {
    logs.push(`[iiko-sync] Unknown iiko status: ${iikoStatus}`);
    return { success: false };
  }

  logs.push(`[iiko-sync] Mapping: ${iikoStatus} → ${websiteStatus}`);

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, order_number, status')
    .eq('iiko_order_id', iikoOrderId)
    .single();

  if (findError || !order) {
    logs.push(`[iiko-sync] Order not found with iiko_order_id: ${iikoOrderId}`);
    return { success: false };
  }

  if (order.status === websiteStatus) {
    logs.push(`[iiko-sync] Status unchanged: ${websiteStatus}`);
    return { success: true, orderNumber: String(order.order_number), newStatus: websiteStatus };
  }

  logs.push(`[iiko-sync] Updating ${order.order_number}: ${order.status} → ${websiteStatus}`);

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: websiteStatus,
      updated_at: new Date().toISOString(),
      ...(websiteStatus === 'delivered' && { delivered_at: new Date().toISOString() }),
    })
    .eq('id', order.id);

  if (updateError) {
    logs.push(`[iiko-sync] Update failed: ${updateError.message}`);
    return { success: false };
  }

  await supabase.from('order_updates').insert({
    order_id: order.id,
    status: websiteStatus,
    notes: `Synced from iiko: ${iikoStatus}`,
  });

  logs.push(`[iiko-sync] ✓ Status updated successfully`);
  return { success: true, orderNumber: String(order.order_number), newStatus: websiteStatus };
}

// Poll all undelivered orders synced with iiko
async function pollAllOrders(
  supabase: any,
  token: string,
  logs: string[]
): Promise<{ synced: number; errors: number }> {
  logs.push('[iiko-sync] Polling all active iiko orders...');

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, iiko_order_id, status')
    .not('iiko_order_id', 'is', null)
    .not('status', 'in', '("delivered","cancelled")');

  if (error || !orders?.length) {
    logs.push(`[iiko-sync] No active orders to sync (${error?.message || 'empty'})`);
    return { synced: 0, errors: 0 };
  }

  logs.push(`[iiko-sync] Found ${orders.length} orders to check`);

  let synced = 0;
  let errorsCount = 0;

  for (const order of orders) {
    const iikoOrderId = String(order.iiko_order_id);
    const iikoStatus = await fetchOrderStatus(token, iikoOrderId);
    
    if (iikoStatus) {
      const result = await updateOrderStatus(supabase, iikoOrderId, iikoStatus.status, logs);
      if (result.success) {
        synced++;
      } else {
        errorsCount++;
      }
    } else {
      errorsCount++;
      logs.push(`[iiko-sync] Failed to fetch status for ${order.order_number}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  logs.push(`[iiko-sync] Poll complete: ${synced} synced, ${errorsCount} errors`);
  return { synced, errors: errorsCount };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] iiko Status Sync triggered`);

  try {
    const apiKey = Deno.env.get('IIKO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!apiKey) {
      logs.push('[iiko-sync] ERROR: IIKO_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'iiko API key not configured', logs }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'poll';

    // WEBHOOK MODE: Receive status updates from iiko (uses signature verification)
    if (action === 'webhook' || req.headers.get('x-iiko-signature')) {
      logs.push('[iiko-sync] Webhook request received');
      
      if (!IIKO_CONFIG.webhookEnabled) {
        logs.push('[iiko-sync] ⚠️ WEBHOOK READY but not activated');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Webhook endpoint ready but not activated. Set webhookEnabled=true to activate.',
            status: 'WEBHOOK_READY',
            logs 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const rawBody = await req.text();
      const signature = req.headers.get('x-iiko-signature');
      const timestamp = req.headers.get('x-iiko-timestamp');
      const webhookSecret = Deno.env.get('IIKO_WEBHOOK_SECRET');
      
      // REQUIRE signature verification for webhooks
      if (!webhookSecret) {
        logs.push('[iiko-sync] ERROR: IIKO_WEBHOOK_SECRET not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Webhook secret not configured', logs }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!signature) {
        logs.push('[iiko-sync] Missing x-iiko-signature header');
        return new Response(
          JSON.stringify({ success: false, error: 'Missing signature', logs }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const payloadToVerify = timestamp ? `${timestamp}.${rawBody}` : rawBody;
      const isValid = await verifySignature(payloadToVerify, signature, webhookSecret);
      
      if (!isValid) {
        logs.push('[iiko-sync] Invalid webhook signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature', logs }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      logs.push('[iiko-sync] ✓ Signature verified');
      
      try {
        const payload: WebhookPayload = JSON.parse(rawBody);
        logs.push(`[iiko-sync] Event: ${payload.eventType}, Order: ${payload.orderId}`);
        
        if (payload.organizationId !== IIKO_CONFIG.organizationId) {
          logs.push('[iiko-sync] Webhook for different organization, ignoring');
          return new Response(
            JSON.stringify({ success: true, ignored: true, logs }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (payload.eventType === 'OrderCancelled') {
          logs.push(`[iiko-sync] Processing cancellation for order: ${payload.orderId}`);
          const result = await updateOrderStatus(supabase, payload.orderId, 'Cancelled', logs);
          
          if (result.success && payload.cancellationReason) {
            const { data: order } = await supabase
              .from('orders')
              .select('id')
              .eq('iiko_order_id', payload.orderId)
              .maybeSingle();
              
            if (order) {
              await supabase.from('order_updates').insert({
                order_id: order.id,
                status: 'cancelled',
                notes: `Cancelled via iiko: ${payload.cancellationReason}`,
              });
            }
          }
          
          return new Response(
            JSON.stringify({ 
              success: result.success, 
              orderNumber: result.orderNumber,
              newStatus: 'cancelled',
              eventType: 'OrderCancelled',
              logs 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await updateOrderStatus(supabase, payload.orderId, payload.status, logs);
        
        return new Response(
          JSON.stringify({ 
            success: result.success, 
            orderNumber: result.orderNumber,
            newStatus: result.newStatus,
            eventType: payload.eventType,
            logs 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        logs.push(`[iiko-sync] Webhook parse error: ${err instanceof Error ? err.message : 'Unknown'}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid webhook payload', logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For poll, sync-order, and status-map actions, require admin auth
    const auth = await authenticateAdmin(req);
    if (!auth) {
      logs.push('[iiko-sync] Unauthorized - no valid auth token');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!auth.isAdmin) {
      logs.push('[iiko-sync] Forbidden - user is not admin');
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - requires admin role', logs }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logs.push(`[iiko-sync] Admin authenticated: ${auth.userId}`);

    // Get iiko token
    const token = await getIikoToken(apiKey);
    if (!token) {
      logs.push('[iiko-sync] Failed to get iiko token');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to authenticate with iiko', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logs.push('[iiko-sync] Token obtained');

    // SINGLE ORDER MODE: Sync specific order
    if (action === 'sync-order') {
      const iikoOrderId = url.searchParams.get('iiko_order_id');
      
      if (!iikoOrderId) {
        return new Response(
          JSON.stringify({ success: false, error: 'iiko_order_id required', logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate UUID format
      if (!UUID_REGEX.test(iikoOrderId)) {
        return new Response(
          JSON.stringify({ success: false, error: 'iiko_order_id must be a valid UUID', logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logs.push(`[iiko-sync] Syncing single order: ${iikoOrderId}`);
      
      const iikoStatus = await fetchOrderStatus(token, iikoOrderId);
      if (!iikoStatus) {
        logs.push('[iiko-sync] Order not found in iiko');
        return new Response(
          JSON.stringify({ success: false, error: 'Order not found in iiko', logs }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await updateOrderStatus(supabase, iikoOrderId, iikoStatus.status, logs);
      
      return new Response(
        JSON.stringify({ 
          success: result.success,
          iikoStatus: iikoStatus.status,
          websiteStatus: result.newStatus,
          orderNumber: result.orderNumber,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POLL MODE (default): Sync all active orders
    if (action === 'poll') {
      const { synced, errors } = await pollAllOrders(supabase, token, logs);
      
      return new Response(
        JSON.stringify({ 
          success: errors === 0,
          synced,
          errors,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STATUS MAP: Return the status mapping
    if (action === 'status-map') {
      return new Response(
        JSON.stringify({ 
          success: true,
          statusMap: IIKO_STATUS_MAP,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action', logs }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[iiko-sync] Unhandled error:', err);
    logs.push(`[iiko-sync] ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
