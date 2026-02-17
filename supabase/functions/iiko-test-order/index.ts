// iiko POS API Integration - Test Order Edge Function
// SECURED: Requires admin authentication

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// iiko Configuration
const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  terminalId: "c7d35f12-dd03-c268-0173-09bb2e4900ce",
  menuId: "9321",
  deliveryOrderTypeId: "76067ea3-356f-eb93-9d14-1fa00d082c4e",
  collectionOrderTypeId: "5b1508f9-fe5b-d6af-cb8d-043af587d5c2",
  paymentTypeId: "0a573de9-37a8-462e-ac58-28a447a0249d",
  baseUrl: "https://api-eu.iiko.services",
};

// Phone validation regex (UAE format)
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

interface TestOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: 'kg' | 'piece';
  price: number;
  notes?: string;
}

interface TestOrderRequest {
  items: TestOrderItem[];
  orderType: 'delivery' | 'collection';
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
}

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

// Validate test order request
function validateTestOrder(body: TestOrderRequest): { valid: boolean; error?: string } {
  if (!body.orderType || !['delivery', 'collection'].includes(body.orderType)) {
    return { valid: false, error: 'orderType must be delivery or collection' };
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { valid: false, error: 'items must be a non-empty array' };
  }
  if (body.items.length > 50) {
    return { valid: false, error: 'items cannot exceed 50 items' };
  }
  for (const item of body.items) {
    if (!item.productId || typeof item.productId !== 'string') {
      return { valid: false, error: 'Each item must have a productId' };
    }
    if (item.productId.length > 100) {
      return { valid: false, error: 'productId must be less than 100 characters' };
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 1000) {
      return { valid: false, error: 'Each item must have a valid quantity (0-1000)' };
    }
    if (typeof item.price !== 'number' || item.price < 0 || item.price > 100000) {
      return { valid: false, error: 'Each item must have a valid price (0-100000)' };
    }
  }
  if (body.customerName && body.customerName.length > 200) {
    return { valid: false, error: 'customerName must be less than 200 characters' };
  }
  if (body.customerPhone && !PHONE_REGEX.test(body.customerPhone)) {
    return { valid: false, error: 'customerPhone must be a valid phone number' };
  }
  if (body.customerAddress && body.customerAddress.length > 500) {
    return { valid: false, error: 'customerAddress must be less than 500 characters' };
  }
  if (body.notes && body.notes.length > 500) {
    return { valid: false, error: 'notes must be less than 500 characters' };
  }
  return { valid: true };
}

// Get iiko access token
async function getIikoToken(apiKey: string): Promise<{ token: string | null; error: string | null }> {
  try {
    console.log('[iiko] Requesting access token...');
    
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[iiko] Token request failed:', response.status, errorText);
      return { token: null, error: `Token request failed: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log('[iiko] Token obtained successfully');
    return { token: data.token, error: null };
  } catch (err) {
    console.error('[iiko] Token request error:', err);
    return { token: null, error: `Token request error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

// Create test order in iiko
async function createIikoTestOrder(
  token: string,
  order: TestOrderRequest
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string; details?: any }> {
  try {
    console.log('[iiko] Creating test order...');
    console.log('[iiko] Order details:', JSON.stringify(order, null, 2));

    const orderTypeId = order.orderType === 'delivery' 
      ? IIKO_CONFIG.deliveryOrderTypeId 
      : IIKO_CONFIG.collectionOrderTypeId;

    const iikoItems = order.items.map(item => ({
      productId: item.productId,
      type: 'Product',
      amount: item.quantity,
      comment: item.notes ? `[TEST] ${item.notes}` : '[TEST ORDER]',
    }));

    const orderPayload = {
      organizationId: IIKO_CONFIG.organizationId,
      terminalGroupId: IIKO_CONFIG.terminalId,
      order: {
        orderTypeId: orderTypeId,
        comment: `[TEST ORDER] ${order.notes || 'Automated test from website'}`,
        customer: {
          name: order.customerName || 'TEST CUSTOMER',
          phone: order.customerPhone || '+971500000000',
        },
        items: iikoItems,
        payments: [
          {
            paymentTypeKind: 'Cash',
            paymentTypeId: IIKO_CONFIG.paymentTypeId,
            sum: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            isProcessedExternally: false,
          }
        ],
        ...(order.orderType === 'delivery' && order.customerAddress && {
          deliveryPoint: {
            address: {
              street: {
                name: order.customerAddress,
              },
            },
          },
        }),
      },
    };

    console.log('[iiko] Sending order to iiko:', JSON.stringify(orderPayload, null, 2));

    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const responseText = await response.text();
    console.log('[iiko] Response status:', response.status);
    console.log('[iiko] Response body:', responseText);

    if (!response.ok) {
      return {
        success: false,
        error: `iiko API error: ${response.status}`,
        details: responseText,
      };
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log('[iiko] Test order created successfully!');
    
    return {
      success: true,
      orderId: responseData.orderInfo?.id || responseData.correlationId,
      orderNumber: responseData.orderInfo?.number || `TEST-${Date.now()}`,
      details: responseData,
    };
  } catch (err) {
    console.error('[iiko] Order creation error:', err);
    return {
      success: false,
      error: `Order creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

// Fetch menu from iiko
async function fetchIikoMenu(token: string): Promise<{ success: boolean; menu?: any; error?: string }> {
  try {
    console.log('[iiko] Fetching menu...');

    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        organizationId: IIKO_CONFIG.organizationId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[iiko] Menu fetch failed:', response.status, errorText);
      return { success: false, error: `Menu fetch failed: ${response.status}` };
    }

    const data = await response.json();
    console.log('[iiko] Menu fetched successfully, products count:', data.products?.length || 0);
    
    return { success: true, menu: data };
  } catch (err) {
    console.error('[iiko] Menu fetch error:', err);
    return { success: false, error: `Menu fetch error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];

  try {
    // AUTHENTICATION CHECK - All actions require admin auth
    const auth = await authenticateAdmin(req);
    if (!auth) {
      logs.push('[iiko] Unauthorized - no valid auth token');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!auth.isAdmin) {
      logs.push('[iiko] Forbidden - user is not admin');
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - requires admin role', logs }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logs.push(`[iiko] Admin authenticated: ${auth.userId}`);

    const apiKey = Deno.env.get('IIKO_API_KEY');
    if (!apiKey) {
      console.error('[iiko] IIKO_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'iiko API key not configured',
          logs: ['ERROR: IIKO_API_KEY environment variable not set']
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'test-order';

    logs.push(`[${new Date().toISOString()}] Action: ${action}`);

    // Get token
    logs.push('[iiko] Requesting access token...');
    const { token, error: tokenError } = await getIikoToken(apiKey);
    
    if (!token) {
      logs.push(`[iiko] Token error: ${tokenError}`);
      return new Response(
        JSON.stringify({ success: false, error: tokenError, logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logs.push('[iiko] Token obtained successfully');

    // Handle different actions
    if (action === 'fetch-menu') {
      logs.push('[iiko] Fetching menu from iiko...');
      const menuResult = await fetchIikoMenu(token);
      logs.push(menuResult.success 
        ? `[iiko] Menu fetched: ${menuResult.menu?.products?.length || 0} products`
        : `[iiko] Menu error: ${menuResult.error}`
      );
      
      return new Response(
        JSON.stringify({ ...menuResult, logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'test-order') {
      const body: TestOrderRequest = await req.json();
      
      // INPUT VALIDATION
      const validation = validateTestOrder(body);
      if (!validation.valid) {
        logs.push(`[iiko] Validation error: ${validation.error}`);
        return new Response(
          JSON.stringify({ success: false, error: validation.error, logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      logs.push(`[iiko] Creating test order with ${body.items?.length || 0} items`);
      logs.push(`[iiko] Order type: ${body.orderType}`);
      
      const orderResult = await createIikoTestOrder(token, body);
      
      if (orderResult.success) {
        logs.push(`[iiko] ✓ Test order created successfully!`);
        logs.push(`[iiko] Order ID: ${orderResult.orderId}`);
        logs.push(`[iiko] Order Number: ${orderResult.orderNumber}`);
      } else {
        logs.push(`[iiko] ✗ Order creation failed: ${orderResult.error}`);
        if (orderResult.details) {
          logs.push(`[iiko] Details: ${JSON.stringify(orderResult.details)}`);
        }
      }

      return new Response(
        JSON.stringify({ ...orderResult, logs }),
        { 
          status: orderResult.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Health check / ping
    if (action === 'ping') {
      logs.push('[iiko] Connection test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'iiko connection OK',
          config: {
            organizationId: IIKO_CONFIG.organizationId,
            terminalId: IIKO_CONFIG.terminalId,
            menuId: IIKO_CONFIG.menuId,
          },
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
    console.error('[iiko] Unhandled error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        logs: [`[ERROR] ${err instanceof Error ? err.message : 'Unknown error'}`]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
