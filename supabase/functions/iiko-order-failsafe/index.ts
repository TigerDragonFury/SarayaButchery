// iiko Order Fail-Safe System
// - Saves orders locally when iiko is down
// - Alerts admin on failures
// - Retries failed orders automatically
// SECURED: Requires admin authentication for retry/pending actions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  terminalId: "c7d35f12-dd03-c268-0173-09bb2e4900ce",
  deliveryOrderTypeId: "76067ea3-356f-eb93-9d14-1fa00d082c4e",
  collectionOrderTypeId: "5b1508f9-fe5b-d6af-cb8d-043af587d5c2",
  paymentTypeId: "0a573de9-37a8-462e-ac58-28a447a0249d",
  baseUrl: "https://api-eu.iiko.services",
  maxRetries: 5,
  retryDelayMs: 2000,
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Phone validation regex (UAE format)
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

interface OrderData {
  orderId: string;
  items: any[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryNotes?: string;
  total: number;
  orderType?: 'delivery' | 'collection';
}

// Authenticate request and check admin role
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

  // Check admin role using service role
  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');

  const isAdmin = (roles?.length || 0) > 0;

  return { userId, isAdmin };
}

// Validate order data
function validateOrderData(body: OrderData): { valid: boolean; error?: string } {
  if (!body.orderId) {
    return { valid: false, error: 'orderId is required' };
  }
  if (!UUID_REGEX.test(body.orderId)) {
    return { valid: false, error: 'orderId must be a valid UUID' };
  }
  if (!body.customerName || typeof body.customerName !== 'string') {
    return { valid: false, error: 'customerName is required' };
  }
  if (body.customerName.length > 200) {
    return { valid: false, error: 'customerName must be less than 200 characters' };
  }
  if (!body.customerPhone || !PHONE_REGEX.test(body.customerPhone)) {
    return { valid: false, error: 'customerPhone must be a valid phone number' };
  }
  if (!body.customerAddress || typeof body.customerAddress !== 'string') {
    return { valid: false, error: 'customerAddress is required' };
  }
  if (body.customerAddress.length > 500) {
    return { valid: false, error: 'customerAddress must be less than 500 characters' };
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { valid: false, error: 'items must be a non-empty array' };
  }
  if (body.items.length > 100) {
    return { valid: false, error: 'items cannot exceed 100 items' };
  }
  if (typeof body.total !== 'number' || body.total < 0) {
    return { valid: false, error: 'total must be a positive number' };
  }
  if (body.total > 1000000) {
    return { valid: false, error: 'total exceeds maximum allowed value' };
  }
  if (body.deliveryNotes && body.deliveryNotes.length > 500) {
    return { valid: false, error: 'deliveryNotes must be less than 500 characters' };
  }
  if (body.orderType && !['delivery', 'collection'].includes(body.orderType)) {
    return { valid: false, error: 'orderType must be delivery or collection' };
  }
  return { valid: true };
}

// Get iiko access token with timeout
async function getIikoToken(apiKey: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error('[iiko-failsafe] Token error:', err);
    return null;
  }
}

// Push order to iiko
async function pushOrderToIiko(
  token: string,
  order: OrderData
): Promise<{ success: boolean; iikoOrderId?: string; error?: string }> {
  try {
    const iikoItems = order.items.map((item: any) => ({
      productId: item.iiko_product_id || item.productId,
      type: 'Product',
      amount: item.quantity,
      comment: item.notes || '',
    }));

    const orderPayload = {
      organizationId: IIKO_CONFIG.organizationId,
      terminalGroupId: IIKO_CONFIG.terminalId,
      order: {
        orderTypeId: order.orderType === 'collection' 
          ? IIKO_CONFIG.collectionOrderTypeId 
          : IIKO_CONFIG.deliveryOrderTypeId,
        comment: order.deliveryNotes || '',
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
        items: iikoItems,
        payments: [{
          paymentTypeKind: 'Cash',
          paymentTypeId: IIKO_CONFIG.paymentTypeId,
          sum: order.total,
          isProcessedExternally: false,
        }],
        ...(order.orderType !== 'collection' && {
          deliveryPoint: {
            address: { street: { name: order.customerAddress } },
          },
        }),
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `iiko error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { 
      success: true, 
      iikoOrderId: data.orderInfo?.id || data.correlationId 
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    if (errorMsg.includes('abort')) {
      return { success: false, error: 'iiko API timeout - service may be down' };
    }
    return { success: false, error: errorMsg };
  }
}

// Create admin alert
async function createAdminAlert(
  supabase: any,
  type: string,
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'critical',
  orderId?: string,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from('admin_alerts').insert({
      type,
      title,
      message,
      severity,
      order_id: orderId,
      metadata: metadata || {},
    });
    console.log(`[iiko-failsafe] Admin alert created: ${title}`);
  } catch (err) {
    console.error('[iiko-failsafe] Failed to create alert:', err);
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] Fail-Safe System triggered`);

  try {
    const apiKey = Deno.env.get('IIKO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'create';

    // For retry-pending and health actions, require admin auth
    if (['retry-pending', 'pending-count', 'health'].includes(action)) {
      const auth = await authenticateAdmin(req);
      if (!auth) {
        logs.push('[iiko-failsafe] Unauthorized - no valid auth token');
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized', logs }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!auth.isAdmin) {
        logs.push('[iiko-failsafe] Forbidden - user is not admin');
        return new Response(
          JSON.stringify({ success: false, error: 'Forbidden - requires admin role', logs }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      logs.push(`[iiko-failsafe] Admin authenticated: ${auth.userId}`);
    }

    // ACTION: Create order with fail-safe
    // This is called internally after checkout, so we verify the order exists in our DB
    if (action === 'create') {
      const body: OrderData = await req.json();
      
      // INPUT VALIDATION
      const validation = validateOrderData(body);
      if (!validation.valid) {
        logs.push(`[iiko-failsafe] Validation error: ${validation.error}`);
        return new Response(
          JSON.stringify({ success: false, error: validation.error, logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      logs.push(`[iiko-failsafe] Processing order: ${body.orderId}`);

      // First, ensure order exists in our database (it should already)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, iiko_synced, iiko_order_id')
        .eq('id', body.orderId)
        .maybeSingle();

      if (orderError || !order) {
        logs.push('[iiko-failsafe] Order not found in database');
        return new Response(
          JSON.stringify({ success: false, error: 'Order not found', logs }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Skip if already synced
      if (order.iiko_synced && order.iiko_order_id) {
        logs.push('[iiko-failsafe] Order already synced to iiko');
        return new Response(
          JSON.stringify({ success: true, alreadySynced: true, iikoOrderId: order.iiko_order_id, logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to get iiko token
      if (!apiKey) {
        logs.push('[iiko-failsafe] IIKO_API_KEY not configured - saving locally');
        await supabase.from('orders').update({
          iiko_synced: false,
          iiko_sync_error: 'IIKO_API_KEY not configured',
          iiko_sync_attempts: 1,
          iiko_sync_last_attempt: new Date().toISOString(),
        }).eq('id', body.orderId);

        await createAdminAlert(supabase, 'iiko_config_error', 
          'iiko API Key Missing', 
          'Orders cannot sync to iiko - API key not configured',
          'critical', body.orderId);

        return new Response(
          JSON.stringify({ success: true, savedLocally: true, reason: 'API key not configured', logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getIikoToken(apiKey);
      
      if (!token) {
        logs.push('[iiko-failsafe] ⚠️ iiko API is DOWN - saving order locally');

        await supabase.from('orders').update({
          iiko_synced: false,
          iiko_sync_error: 'iiko API unreachable - token request failed',
          iiko_sync_attempts: 1,
          iiko_sync_last_attempt: new Date().toISOString(),
        }).eq('id', body.orderId);

        await createAdminAlert(supabase, 'iiko_api_down',
          '⚠️ iiko API Down - Order Saved Locally',
          `Order ${order.order_number} saved locally. iiko sync failed - API may be down.`,
          'critical', body.orderId, { orderNumber: order.order_number });

        return new Response(
          JSON.stringify({ 
            success: true, 
            savedLocally: true, 
            reason: 'iiko API unreachable',
            orderNumber: order.order_number,
            logs 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to push order to iiko
      const result = await pushOrderToIiko(token, body);

      if (result.success) {
        logs.push(`[iiko-failsafe] ✓ Order synced to iiko: ${result.iikoOrderId}`);
        
        await supabase.from('orders').update({
          iiko_synced: true,
          iiko_order_id: result.iikoOrderId,
          iiko_sync_error: null,
          iiko_sync_attempts: 1,
          iiko_sync_last_attempt: new Date().toISOString(),
        }).eq('id', body.orderId);

        return new Response(
          JSON.stringify({ success: true, iikoOrderId: result.iikoOrderId, logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        logs.push(`[iiko-failsafe] ⚠️ Sync failed: ${result.error}`);

        await supabase.from('orders').update({
          iiko_synced: false,
          iiko_sync_error: result.error,
          iiko_sync_attempts: 1,
          iiko_sync_last_attempt: new Date().toISOString(),
        }).eq('id', body.orderId);

        await createAdminAlert(supabase, 'iiko_sync_failed',
          'iiko Sync Failed - Order Saved Locally',
          `Order ${order.order_number} sync failed: ${result.error}`,
          'warning', body.orderId, { error: result.error });

        return new Response(
          JSON.stringify({ success: true, savedLocally: true, error: result.error, logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACTION: Retry failed orders (ADMIN ONLY - authenticated above)
    if (action === 'retry-pending') {
      logs.push('[iiko-failsafe] Retrying pending orders...');

      if (!apiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'IIKO_API_KEY not configured', logs }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: pendingOrders, error: queryError } = await supabase
        .from('orders')
        .select('*')
        .eq('iiko_synced', false)
        .is('iiko_order_id', null)
        .lt('iiko_sync_attempts', IIKO_CONFIG.maxRetries)
        .order('created_at', { ascending: true })
        .limit(10);

      if (queryError || !pendingOrders?.length) {
        logs.push('[iiko-failsafe] No pending orders to retry');
        return new Response(
          JSON.stringify({ success: true, retried: 0, logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logs.push(`[iiko-failsafe] Found ${pendingOrders.length} orders to retry`);

      const token = await getIikoToken(apiKey);
      if (!token) {
        logs.push('[iiko-failsafe] Cannot retry - iiko still unreachable');
        return new Response(
          JSON.stringify({ success: false, error: 'iiko still unreachable', logs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let successCount = 0;
      let failCount = 0;

      for (const order of pendingOrders) {
        const orderData: OrderData = {
          orderId: order.id,
          items: order.items,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.delivery_address,
          deliveryNotes: order.delivery_notes,
          total: order.total,
          orderType: order.source === 'collection' ? 'collection' : 'delivery',
        };

        const result = await pushOrderToIiko(token, orderData);
        const newAttempts = (order.iiko_sync_attempts || 0) + 1;

        if (result.success) {
          await supabase.from('orders').update({
            iiko_synced: true,
            iiko_order_id: result.iikoOrderId,
            iiko_sync_error: null,
            iiko_sync_attempts: newAttempts,
            iiko_sync_last_attempt: new Date().toISOString(),
          }).eq('id', order.id);

          logs.push(`[iiko-failsafe] ✓ Retry success: ${order.order_number}`);
          successCount++;
        } else {
          await supabase.from('orders').update({
            iiko_sync_error: result.error,
            iiko_sync_attempts: newAttempts,
            iiko_sync_last_attempt: new Date().toISOString(),
          }).eq('id', order.id);

          logs.push(`[iiko-failsafe] ✗ Retry failed: ${order.order_number} - ${result.error}`);
          failCount++;

          if (newAttempts >= IIKO_CONFIG.maxRetries) {
            await createAdminAlert(supabase, 'iiko_max_retries',
              '⛔ Order Max Retries Reached',
              `Order ${order.order_number} failed after ${newAttempts} attempts. Manual intervention required.`,
              'critical', order.id);
          }
        }

        await new Promise(r => setTimeout(r, IIKO_CONFIG.retryDelayMs));
      }

      logs.push(`[iiko-failsafe] Retry complete: ${successCount} success, ${failCount} failed`);

      return new Response(
        JSON.stringify({ success: true, retried: successCount, failed: failCount, logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Get pending orders count (ADMIN ONLY - authenticated above)
    if (action === 'pending-count') {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('iiko_synced', false)
        .is('iiko_order_id', null);

      return new Response(
        JSON.stringify({ success: true, pendingCount: count || 0, error: error?.message, logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Health check (ADMIN ONLY - authenticated above)
    if (action === 'health') {
      const token = apiKey ? await getIikoToken(apiKey) : null;
      const iikoStatus = token ? 'connected' : 'unreachable';

      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('iiko_synced', false)
        .is('iiko_order_id', null);

      return new Response(
        JSON.stringify({ 
          success: true, 
          iikoStatus,
          pendingOrders: pendingCount || 0,
          maxRetries: IIKO_CONFIG.maxRetries,
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
    console.error('[iiko-failsafe] Error:', err);
    logs.push(`[ERROR] ${err instanceof Error ? err.message : 'Unknown'}`);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown', logs }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
