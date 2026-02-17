// iiko POS Integration - Create Order Edge Function
// Sends website orders directly to iiko/Syrve POS system
// Returns official iiko order number for customer display

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// iiko Configuration
const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  terminalId: "c7d35f12-dd03-c268-0173-09bb2e4900ce",
  deliveryOrderTypeId: "76067ea3-356f-eb93-9d14-1fa00d082c4e",
  collectionOrderTypeId: "5b1508f9-fe5b-d6af-cb8d-043af587d5c2",
  paymentTypeIdCash: "0a573de9-37a8-462e-ac58-28a447a0249d",
  // Website Order product - Price: 0, all details in comment
  websiteOrderProductId: "dc0ee655-2e56-4535-9241-ddd2f4eb8a26",
  baseUrl: "https://api-eu.iiko.services",
};

interface OrderItem {
  productId: string;
  productName: string;
  productNameEn?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  customerNotes?: string;
  category?: string;
}

interface CheckoutOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_notes?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  total_weight?: number;
  order_type?: string;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  branch_name?: string;
  idempotency_key: string;
}

interface DatabaseOrder extends CheckoutOrderData {
  id: string;
  order_number: string;
  source: string;
  status: string;
}

// Get iiko access token
async function getIikoToken(apiKey: string): Promise<{ token: string | null; error: string | null }> {
  try {
    console.log('[iiko-create] Requesting access token...');
    
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[iiko-create] Token request failed:', response.status, errorText);
      return { token: null, error: `Token request failed: ${response.status}` };
    }

    const data = await response.json();
    console.log('[iiko-create] Token obtained successfully');
    return { token: data.token, error: null };
  } catch (err) {
    console.error('[iiko-create] Token request error:', err);
    return { token: null, error: `Token error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// Create order in iiko and get official order number
async function createIikoOrder(
  token: string,
  order: DatabaseOrder | CheckoutOrderData,
  externalNumber: string
): Promise<{ 
  success: boolean; 
  iikoOrderId?: string; 
  iikoOrderNumber?: string;
  correlationId?: string; 
  error?: string; 
  details?: any 
}> {
  try {
    console.log(`[iiko-create] Creating iiko order for: ${externalNumber}`);
    console.log(`[iiko-create] Customer: ${order.customer_name}, Phone: ${order.customer_phone}`);
    console.log(`[iiko-create] Items count: ${order.items?.length || 0}, Total: ${order.total} AED`);

    // Format phone number for iiko (must start with + and be valid)
    let phone = (order.customer_phone || '').replace(/\s+/g, '').replace(/-/g, '');
    if (!phone) {
      phone = '+971500000000'; // Default fallback
    } else if (!phone.startsWith('+')) {
      // Remove leading zero and add UAE country code
      phone = phone.replace(/^0+/, '');
      phone = phone.startsWith('971') ? `+${phone}` : `+971${phone}`;
    }
    console.log(`[iiko-create] Formatted phone: ${order.customer_phone} -> ${phone}`);

    // Build detailed items description for iiko comment
    const itemsDetails = (order.items || []).map((item, index) => {
      const notes = item.customerNotes ? ` [${item.customerNotes}]` : '';
      return `${index + 1}. ${item.productName} x${item.quantity}${item.unit} @ ${item.pricePerUnit} AED${notes}`;
    }).join(' | ');

    console.log(`[iiko-create] Building order with ${order.items?.length || 0} items as Website Order`);

    // Build full order comment with all details
    const orderComment = [
      `🛒 Website Order`,
      `📦 Items: ${itemsDetails}`,
      order.total_weight ? `⚖️ Weight: ${order.total_weight} kg` : '',
      `💵 Subtotal: ${order.subtotal} AED`,
      order.delivery_fee ? `🚚 Delivery: ${order.delivery_fee} AED` : '',
      order.discount ? `🏷️ Discount: -${order.discount} AED` : '',
      `💰 Total: ${order.total} AED`,
      order.delivery_notes ? `📝 Notes: ${order.delivery_notes}` : '',
      order.scheduled_date ? `📅 Scheduled: ${order.scheduled_date} ${order.scheduled_time_slot || ''}` : '',
    ].filter(Boolean).join(' | ');

    // All online orders use single "Website Order" product
    const iikoItems = [
      {
        productId: IIKO_CONFIG.websiteOrderProductId,
        type: 'Product',
        amount: 1,
        price: order.total,
        comment: itemsDetails.slice(0, 255),
      }
    ];

    // Determine order type ID based on pickup/delivery
    const orderTypeId = order.order_type === 'pickup' 
      ? IIKO_CONFIG.collectionOrderTypeId 
      : IIKO_CONFIG.deliveryOrderTypeId;

    // Build order payload
    const orderPayload: any = {
      organizationId: IIKO_CONFIG.organizationId,
      terminalGroupId: IIKO_CONFIG.terminalId,
      order: {
        orderTypeId: orderTypeId,
        externalNumber: externalNumber,
        phone: phone,
        comment: orderComment.slice(0, 1000),
        customer: {
          name: order.customer_name.slice(0, 100),
          phone: phone,
          ...(order.customer_email && { email: order.customer_email }),
        },
        items: iikoItems,
        payments: [
          {
            paymentTypeKind: 'Cash',
            paymentTypeId: IIKO_CONFIG.paymentTypeIdCash,
            sum: order.total,
            isProcessedExternally: false,
          }
        ],
      },
    };

    // Add delivery point for delivery orders
    if (order.order_type !== 'pickup') {
      orderPayload.order.deliveryPoint = {
        address: {
          street: {
            name: order.delivery_city || 'Abu Dhabi',
          },
          house: order.delivery_address.slice(0, 200),
        },
        comment: order.delivery_notes?.slice(0, 255) || undefined,
      };
    }

    console.log('[iiko-create] Sending Website Order to iiko API...');
    console.log('[iiko-create] Order Type:', order.order_type === 'pickup' ? 'Collection' : 'Delivery');
    
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/deliveries/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const responseText = await response.text();
    console.log('[iiko-create] ═══════════════════════════════════════');
    console.log('[iiko-create] 📡 RESPONSE FROM iiko API');
    console.log('[iiko-create] ═══════════════════════════════════════');
    console.log('[iiko-create] Status Code:', response.status);
    console.log('[iiko-create] Status Text:', response.statusText);
    
    // Log raw response
    console.log('[iiko-create] Raw Response Text:');
    console.log(responseText);
    console.log('[iiko-create] ───────────────────────────────────────');

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      console.log('[iiko-create] Parsed JSON Response:');
      console.log(JSON.stringify(responseData, null, 2));
    } catch (parseErr) {
      console.error('[iiko-create] Failed to parse JSON:', parseErr);
      responseData = { raw: responseText };
      console.log('[iiko-create] Stored as raw text');
    }
    console.log('[iiko-create] ═══════════════════════════════════════');

    if (!response.ok) {
      console.error('[iiko-create] ❌ iiko API error:', response.status);
      console.error('[iiko-create] Error details:', JSON.stringify(responseData, null, 2));
      return {
        success: false,
        error: `iiko API error: ${response.status}`,
        details: responseData,
      };
    }

    const iikoOrderId = responseData.orderInfo?.id || null;
    const correlationId = responseData.correlationId || null;
    
    // Extract official order number from iiko response
    // iiko returns orderNumber, chequeNumber, or number depending on API version
    const iikoOrderNumber = responseData.orderInfo?.number 
      || responseData.orderInfo?.orderNumber 
      || responseData.orderInfo?.chequeNumber
      || responseData.orderNumber
      || null;

    console.log('[iiko-create] ✅ Order created in iiko!');
    console.log('[iiko-create] 📊 Extracted Data:');
    console.log(`[iiko-create]   - Order ID: ${iikoOrderId}`);
    console.log(`[iiko-create]   - Order Number: ${iikoOrderNumber}`);
    console.log(`[iiko-create]   - Correlation ID: ${correlationId}`);
    console.log('[iiko-create] Full orderInfo object:', JSON.stringify(responseData.orderInfo, null, 2));

    return {
      success: true,
      iikoOrderId,
      iikoOrderNumber,
      correlationId,
      details: responseData,
    };
  } catch (err) {
    console.error('[iiko-create] Order creation error:', err);
    return {
      success: false,
      error: `Order creation failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
}

// Fetch order details from iiko to get official number if not returned initially
async function fetchIikoOrderDetails(
  token: string, 
  iikoOrderId: string
): Promise<{ orderNumber: string | null; error: string | null }> {
  try {
    console.log(`[iiko-create] Fetching order details for: ${iikoOrderId}`);
    
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
      const errorText = await response.text();
      console.error('[iiko-create] Fetch order details failed:', response.status, errorText);
      return { orderNumber: null, error: `Failed to fetch: ${response.status}` };
    }

    const data = await response.json();
    const orderInfo = data.orders?.[0];
    
    const orderNumber = orderInfo?.number 
      || orderInfo?.orderNumber 
      || orderInfo?.chequeNumber
      || null;
    
    console.log(`[iiko-create] Fetched iiko order number: ${orderNumber}`);
    return { orderNumber, error: null };
  } catch (err) {
    console.error('[iiko-create] Fetch order details error:', err);
    return { orderNumber: null, error: `Fetch error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ========== RATE LIMITING ==========
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max orders per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

// Clean up old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 10 * 60 * 1000);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] iiko Create Order triggered`);

  // ========== IP-BASED RATE LIMITING ==========
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';

  if (!checkRateLimit(clientIp)) {
    logs.push(`[iiko-create] Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Too many orders. Please try again later.',
        error_ar: 'عدد كبير من الطلبات. يرجى المحاولة لاحقاً.',
        logs 
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = Deno.env.get('IIKO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!apiKey) {
      logs.push('[iiko-create] ERROR: IIKO_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'iiko API key not configured', logs }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    
    // Check if this is a direct checkout request (has order_data) or existing order sync
    const isDirectCheckout = !!body.order_data;
    const idempotencyKey = body.idempotency_key;
    const orderNumber = body.order_number;
    const orderId = body.order_id;

    // ========== IDEMPOTENCY CHECK ==========
    if (idempotencyKey) {
      logs.push(`[iiko-create] Checking idempotency key: ${idempotencyKey}`);
      
      const { data: existingOrder, error: lookupError } = await supabase
        .from('orders')
        .select('id, order_number, iiko_order_id, iiko_order_number, iiko_synced')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingOrder && existingOrder.iiko_synced) {
        logs.push(`[iiko-create] ✓ Order already exists with idempotency key (duplicate prevented)`);
        return new Response(
          JSON.stringify({
            success: true,
            alreadyExists: true,
            orderId: existingOrder.id,
            orderNumber: existingOrder.iiko_order_number || existingOrder.order_number,
            iikoOrderId: existingOrder.iiko_order_id,
            iikoOrderNumber: existingOrder.iiko_order_number,
            logs,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========== DIRECT CHECKOUT MODE ==========
    if (isDirectCheckout) {
      logs.push('[iiko-create] Direct checkout mode - creating order in iiko first');
      
      const orderData: CheckoutOrderData = body.order_data;
      
      if (!orderData.customer_name || !orderData.customer_phone || !orderData.items?.length) {
        logs.push('[iiko-create] ERROR: Missing required order data');
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required order data', logs }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get iiko token
      logs.push('[iiko-create] Getting iiko token...');
      const { token, error: tokenError } = await getIikoToken(apiKey);

      if (!token) {
        logs.push(`[iiko-create] Token error: ${tokenError}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'تعذر الاتصال بنظام الكاشير. يرجى المحاولة مرة أخرى.',
            technicalError: tokenError,
            logs 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a temporary external number for iiko
      const tempExternalNumber = `WEB-${Date.now()}`;
      
      // Create order in iiko FIRST
      logs.push('[iiko-create] Creating order in iiko...');
      const iikoResult = await createIikoOrder(token, orderData, tempExternalNumber);

      if (!iikoResult.success || !iikoResult.iikoOrderId) {
        logs.push(`[iiko-create] iiko order creation failed: ${iikoResult.error}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'تعذر تأكيد الطلب. يرجى المحاولة مرة أخرى.',
            technicalError: iikoResult.error,
            details: iikoResult.details,
            logs 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If no order number returned, try to fetch it
      let finalOrderNumber = iikoResult.iikoOrderNumber;
      if (!finalOrderNumber && iikoResult.iikoOrderId) {
        logs.push('[iiko-create] Order number not in response, fetching details...');
        const { orderNumber: fetchedNumber } = await fetchIikoOrderDetails(token, iikoResult.iikoOrderId);
        finalOrderNumber = fetchedNumber;
      }

      // Generate fallback if iiko doesn't return a number
      if (!finalOrderNumber) {
        finalOrderNumber = `#${Date.now().toString().slice(-6)}`;
        logs.push(`[iiko-create] Using generated order number: ${finalOrderNumber}`);
      }

      logs.push(`[iiko-create] ✓ iiko order created: ${iikoResult.iikoOrderId}, Number: ${finalOrderNumber}`);

      // Now save to database with iiko info
      const dbOrderId = crypto.randomUUID();
      const internalOrderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          id: dbOrderId,
          order_number: internalOrderNumber,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email || null,
          delivery_address: orderData.delivery_address,
          delivery_city: orderData.delivery_city || 'Abu Dhabi',
          delivery_notes: orderData.delivery_notes || null,
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          discount: orderData.discount || 0,
          total: orderData.total,
          total_weight: orderData.total_weight || 0,
          order_type: orderData.order_type || 'delivery',
          scheduled_date: orderData.scheduled_date || null,
          scheduled_time_slot: orderData.scheduled_time_slot || null,
          branch_name: orderData.branch_name || null,
          source: 'website',
          status: 'confirmed', // Already confirmed since iiko accepted it
          iiko_synced: true,
          iiko_order_id: iikoResult.iikoOrderId,
          iiko_order_number: finalOrderNumber,
          iiko_sync_attempts: 1,
          iiko_sync_last_attempt: new Date().toISOString(),
          idempotency_key: idempotencyKey || null,
        });

      if (dbError) {
        logs.push(`[iiko-create] CRITICAL: Database insert failed: ${dbError.message}`);
        console.error('[iiko-create] CRITICAL DB Error:', dbError);
        
        // RETRY: Try inserting again after a short delay
        logs.push('[iiko-create] Retrying database insert...');
        const { error: retryError } = await supabase
          .from('orders')
          .insert({
            id: dbOrderId,
            order_number: internalOrderNumber,
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            customer_email: orderData.customer_email || null,
            delivery_address: orderData.delivery_address,
            delivery_city: orderData.delivery_city || 'Abu Dhabi',
            delivery_notes: orderData.delivery_notes || null,
            items: orderData.items,
            subtotal: orderData.subtotal,
            delivery_fee: orderData.delivery_fee,
            discount: orderData.discount || 0,
            total: orderData.total,
            total_weight: orderData.total_weight || 0,
            order_type: orderData.order_type || 'delivery',
            scheduled_date: orderData.scheduled_date || null,
            scheduled_time_slot: orderData.scheduled_time_slot || null,
            branch_name: orderData.branch_name || null,
            source: 'website',
            status: 'confirmed',
            iiko_synced: true,
            iiko_order_id: iikoResult.iikoOrderId,
            iiko_order_number: finalOrderNumber,
            iiko_sync_attempts: 1,
            iiko_sync_last_attempt: new Date().toISOString(),
            idempotency_key: idempotencyKey || null,
          });

        if (retryError) {
          logs.push(`[iiko-create] CRITICAL: Retry also failed: ${retryError.message}`);
          console.error('[iiko-create] RETRY ALSO FAILED:', retryError);
          // Return error so customer knows to contact support
          return new Response(
            JSON.stringify({
              success: false,
              error: 'تم تسجيل الطلب في الكاشير لكن فشل الحفظ في النظام. يرجى التواصل مع الدعم.',
              technicalError: retryError.message,
              iikoOrderId: iikoResult.iikoOrderId,
              iikoOrderNumber: finalOrderNumber,
              logs,
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        logs.push('[iiko-create] ✓ Retry successful - order saved to database');
      }

      // Insert order items
      if (orderData.items?.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: dbOrderId,
          product_id: item.productId,
          product_name: item.productName,
          product_name_en: item.productNameEn || null,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.pricePerUnit,
          subtotal: item.totalPrice,
          notes: item.customerNotes || null,
        }));

        await supabase.from('order_items').insert(orderItems);
      }

      // Add order update record
      await supabase.from('order_updates').insert({
        order_id: dbOrderId,
        status: 'confirmed',
        notes: `✓ Order synced to iiko POS. iiko ID: ${iikoResult.iikoOrderId}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          orderId: dbOrderId,
          orderNumber: finalOrderNumber, // Return iiko number as main order number
          internalOrderNumber: internalOrderNumber,
          iikoOrderId: iikoResult.iikoOrderId,
          iikoOrderNumber: finalOrderNumber,
          correlationId: iikoResult.correlationId,
          logs,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== EXISTING ORDER SYNC MODE ==========
    if (!orderNumber && !orderId) {
      logs.push('[iiko-create] ERROR: order_number, order_id, or order_data required');
      return new Response(
        JSON.stringify({ success: false, error: 'order_number, order_id, or order_data required', logs }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`[iiko-create] Existing order sync: ${orderNumber || orderId}`);

    // Fetch order from database
    let query = supabase.from('orders').select('*');
    if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else {
      query = query.eq('id', orderId);
    }

    const { data: order, error: fetchError } = await query.single();

    if (fetchError || !order) {
      logs.push(`[iiko-create] Order not found: ${fetchError?.message || 'No data'}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found', logs }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`[iiko-create] Found order: ${order.order_number}`);

    // Check if already synced
    if (order.iiko_synced && order.iiko_order_id) {
      logs.push(`[iiko-create] Order already synced to iiko: ${order.iiko_order_id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadySynced: true,
          iikoOrderId: order.iiko_order_id,
          iikoOrderNumber: order.iiko_order_number,
          orderNumber: order.iiko_order_number || order.order_number,
          logs 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get iiko token
    logs.push('[iiko-create] Getting iiko token...');
    const { token, error: tokenError } = await getIikoToken(apiKey);

    if (!token) {
      logs.push(`[iiko-create] Token error: ${tokenError}`);
      
      await supabase.from('orders').update({
        iiko_sync_attempts: (order.iiko_sync_attempts || 0) + 1,
        iiko_sync_error: tokenError,
        iiko_sync_last_attempt: new Date().toISOString(),
      }).eq('id', order.id);

      return new Response(
        JSON.stringify({ success: false, error: tokenError, logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push('[iiko-create] Token obtained, creating order in iiko...');

    // Create order in iiko
    const result = await createIikoOrder(token, order as DatabaseOrder, order.order_number);

    if (result.success && result.iikoOrderId) {
      // Try to get order number if not returned
      let finalOrderNumber = result.iikoOrderNumber;
      if (!finalOrderNumber) {
        const { orderNumber: fetchedNumber } = await fetchIikoOrderDetails(token, result.iikoOrderId);
        finalOrderNumber = fetchedNumber;
      }

      logs.push(`[iiko-create] ✓ SUCCESS! iiko Order ID: ${result.iikoOrderId}, Number: ${finalOrderNumber}`);

      // Update order with iiko sync info
      await supabase.from('orders').update({
        iiko_synced: true,
        iiko_order_id: result.iikoOrderId,
        iiko_order_number: finalOrderNumber,
        iiko_sync_attempts: (order.iiko_sync_attempts || 0) + 1,
        iiko_sync_error: null,
        iiko_sync_last_attempt: new Date().toISOString(),
        status: 'confirmed',
      }).eq('id', order.id);

      // Add order update record
      await supabase.from('order_updates').insert({
        order_id: order.id,
        status: 'confirmed',
        notes: `Synced to iiko POS. iiko ID: ${result.iikoOrderId}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          orderNumber: finalOrderNumber || order.order_number,
          iikoOrderId: result.iikoOrderId,
          iikoOrderNumber: finalOrderNumber,
          correlationId: result.correlationId,
          logs,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      logs.push(`[iiko-create] ✗ FAILED: ${result.error}`);

      // Update order with sync failure
      await supabase.from('orders').update({
        iiko_sync_attempts: (order.iiko_sync_attempts || 0) + 1,
        iiko_sync_error: result.error,
        iiko_sync_last_attempt: new Date().toISOString(),
      }).eq('id', order.id);

      // Create admin alert for sync failure
      await supabase.from('admin_alerts').insert({
        type: 'iiko_sync_failed',
        severity: 'warning',
        title: `iiko Sync Failed: ${order.order_number}`,
        message: `Order ${order.order_number} failed to sync to iiko: ${result.error}`,
        order_id: order.id,
        metadata: { error: result.error, details: result.details },
      });

      return new Response(
        JSON.stringify({
          success: false,
          orderNumber: order.order_number,
          error: result.error,
          details: result.details,
          logs,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('[iiko-create] Unhandled error:', err);
    logs.push(`[iiko-create] ERROR: ${err instanceof Error ? err.message : 'Unknown'}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        logs,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
