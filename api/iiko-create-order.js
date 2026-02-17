import https from 'https';
import { URL } from 'url';
import crypto from 'crypto';

const IIKO_CONFIG = {
  organizationId: '32d5187a-c03f-4b28-8c7f-901e91dc639c',
  terminalId: 'c7d35f12-dd03-c268-0173-09bb2e4900ce',
  deliveryOrderTypeId: '76067ea3-356f-eb93-9d14-1fa00d082c4e',
  collectionOrderTypeId: '5b1508f9-fe5b-d6af-cb8d-043af587d5c2',
  paymentTypeIdCash: '0a573de9-37a8-462e-ac58-28a447a0249d',
  websiteOrderProductId: 'dc0ee655-2e56-4535-9241-ddd2f4eb8a26',
  baseUrl: 'https://api-eu.iiko.services',
};

function httpsRequest(url, method, data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (err) {
          // Return raw body for troubleshooting
        }
        resolve({ status: res.statusCode || 0, data: parsed, raw: body });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getIikoToken(apiLogin) {
  try {
    const response = await httpsRequest(
      `${IIKO_CONFIG.baseUrl}/api/1/access_token`,
      'POST',
      { apiLogin }
    );

    if (response.status !== 200 || !response.data?.token) {
      return { token: null, error: `Token request failed: ${response.status}` };
    }

    return { token: response.data.token, error: null };
  } catch (err) {
    return { token: null, error: `Token error: ${err?.message || 'Unknown'}` };
  }
}

function formatPhone(phoneRaw) {
  let phone = (phoneRaw || '').replace(/\s+/g, '').replace(/-/g, '');
  if (!phone) {
    return '+971500000000';
  }
  if (!phone.startsWith('+')) {
    phone = phone.replace(/^0+/, '');
    phone = phone.startsWith('971') ? `+${phone}` : `+971${phone}`;
  }
  return phone;
}

function getCompleteBefore(order) {
  if (order.scheduled_date) {
    const timeSlot = (order.scheduled_time_slot || '').split('-')[0] || '12:00';
    const [hourStr, minuteStr] = timeSlot.split(':');
    const date = new Date(`${order.scheduled_date}T00:00:00`);
    date.setHours(parseInt(hourStr || '12', 10), parseInt(minuteStr || '0', 10), 0, 0);
    return date.toISOString();
  }

  const fallback = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return fallback.toISOString();
}

async function createIikoOrder(token, order, externalNumber) {
  try {
    const phone = formatPhone(order.customer_phone);
    const orderId = crypto.randomUUID();
    const completeBefore = getCompleteBefore(order);
    const itemsDetails = (order.items || []).map((item, index) => {
      const notes = item.customerNotes ? ` [${item.customerNotes}]` : '';
      return `${index + 1}. ${item.productName} x${item.quantity}${item.unit} @ ${item.pricePerUnit} AED${notes}`;
    }).join(' | ');

    const orderComment = [
      'Website Order',
      `Items: ${itemsDetails}`,
      order.total_weight ? `Weight: ${order.total_weight} kg` : '',
      `Subtotal: ${order.subtotal} AED`,
      order.delivery_fee ? `Delivery: ${order.delivery_fee} AED` : '',
      order.discount ? `Discount: -${order.discount} AED` : '',
      `Total: ${order.total} AED`,
      order.delivery_notes ? `Notes: ${order.delivery_notes}` : '',
      order.scheduled_date ? `Scheduled: ${order.scheduled_date} ${order.scheduled_time_slot || ''}` : '',
    ].filter(Boolean).join(' | ');

    const iikoItems = [
      {
        productId: IIKO_CONFIG.websiteOrderProductId,
        type: 'Product',
        amount: 1,
        price: order.total,
        comment: itemsDetails.slice(0, 255),
      }
    ];

    const orderTypeId = order.order_type === 'pickup'
      ? IIKO_CONFIG.collectionOrderTypeId
      : IIKO_CONFIG.deliveryOrderTypeId;

    const orderPayload = {
      organizationId: IIKO_CONFIG.organizationId,
      terminalGroupId: IIKO_CONFIG.terminalId,
      order: {
        id: orderId,
        date: new Date().toISOString(),
        completeBefore: completeBefore,
        orderTypeId: orderTypeId,
        externalNumber: externalNumber,
        sourceKey: 'website',
        phone: phone,
        comment: orderComment.slice(0, 1000),
        customer: {
          name: (order.customer_name || '').slice(0, 100),
          phone: phone,
          ...(order.customer_email ? { email: order.customer_email } : {}),
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

    if (order.order_type !== 'pickup') {
      orderPayload.order.deliveryPoint = {
        address: {
          street: { name: order.delivery_city || 'Abu Dhabi' },
          house: (order.delivery_address || '').slice(0, 200),
        },
        comment: order.delivery_notes?.slice(0, 255) || undefined,
      };
    }

    const response = await httpsRequest(
      `${IIKO_CONFIG.baseUrl}/api/1/deliveries/create`,
      'POST',
      orderPayload,
      token
    );

    if (response.status !== 200) {
      return {
        success: false,
        error: `iiko API error: ${response.status}`,
        details: response.data || response.raw,
      };
    }

    const responseData = response.data || {};
    const iikoOrderId = responseData.orderInfo?.id || null;
    const correlationId = responseData.correlationId || null;
    const iikoOrderNumber = responseData.orderInfo?.number
      || responseData.orderInfo?.orderNumber
      || responseData.orderInfo?.chequeNumber
      || responseData.orderNumber
      || null;

    return {
      success: true,
      iikoOrderId,
      iikoOrderNumber,
      correlationId,
      details: responseData,
    };
  } catch (err) {
    return {
      success: false,
      error: `Order creation failed: ${err?.message || 'Unknown'}`,
    };
  }
}

async function fetchIikoOrderDetails(token, iikoOrderId) {
  const response = await httpsRequest(
    `${IIKO_CONFIG.baseUrl}/api/1/deliveries/by_id`,
    'POST',
    {
      organizationId: IIKO_CONFIG.organizationId,
      orderIds: [iikoOrderId],
    },
    token
  );

  if (response.status !== 200) {
    return { orderNumber: null, error: `Failed to fetch: ${response.status}` };
  }

  const orderInfo = response.data?.orders?.[0];
  const orderNumber = orderInfo?.number
    || orderInfo?.orderNumber
    || orderInfo?.chequeNumber
    || null;

  return { orderNumber, error: null };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const apiLogin = process.env.IIKO_API_LOGIN;
    if (!apiLogin) {
      return res.status(500).json({ success: false, error: 'IIKO_API_LOGIN not configured' });
    }

    const body = req.body || {};
    const orderData = body.order_data;

    if (!orderData) {
      return res.status(400).json({ success: false, error: 'order_data is required' });
    }

    const { token, error: tokenError } = await getIikoToken(apiLogin);
    if (!token) {
      return res.status(503).json({ success: false, error: tokenError || 'Failed to get token' });
    }

    const tempExternalNumber = `WEB-${Date.now()}`;
    const iikoResult = await createIikoOrder(token, orderData, tempExternalNumber);

    if (!iikoResult.success || !iikoResult.iikoOrderId) {
      return res.status(400).json({
        success: false,
        error: iikoResult.error || 'Order creation failed',
        details: iikoResult.details,
      });
    }

    let finalOrderNumber = iikoResult.iikoOrderNumber;
    if (!finalOrderNumber && iikoResult.iikoOrderId) {
      const { orderNumber: fetchedNumber } = await fetchIikoOrderDetails(token, iikoResult.iikoOrderId);
      finalOrderNumber = fetchedNumber || null;
    }

    if (!finalOrderNumber) {
      finalOrderNumber = `#${Date.now().toString().slice(-6)}`;
    }

    return res.status(200).json({
      success: true,
      orderNumber: finalOrderNumber,
      iikoOrderId: iikoResult.iikoOrderId,
      iikoOrderNumber: finalOrderNumber,
      correlationId: iikoResult.correlationId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error',
    });
  }
}
