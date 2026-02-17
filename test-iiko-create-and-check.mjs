import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const BASE_URL = process.env.BASE_URL || 'https://saraya-butchery-beta.vercel.app';

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync('.env', 'utf-8');
    content.split('\n').forEach((line) => {
      if (line.trim() && !line.trim().startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        let value = valueParts.join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    });
  } catch (err) {
    // .env not required if vars are already in process.env
  }
  return env;
}

const localEnv = loadEnv();
const IIKO_API_URL = process.env.IIKO_API_URL || localEnv.IIKO_API_URL || 'https://api-eu.iiko.services';
const IIKO_API_LOGIN = process.env.IIKO_API_LOGIN || localEnv.IIKO_API_LOGIN;
const IIKO_ORG_ID = process.env.IIKO_ORG_ID || localEnv.IIKO_ORG_ID;

function httpsRequest(url, method, data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
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
          // ignore parse error
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

async function getToken() {
  const response = await httpsRequest(
    `${IIKO_API_URL}/api/1/access_token`,
    'POST',
    { apiLogin: IIKO_API_LOGIN }
  );

  if (response.status !== 200 || !response.data?.token) {
    throw new Error(`Token failed: ${response.status}`);
  }

  return response.data.token;
}

async function createTestOrder() {
  const orderPayload = {
    order_data: {
      customer_name: 'Test Customer',
      customer_phone: '0500000000',
      customer_email: 'test@example.com',
      delivery_address: 'Test Address, Abu Dhabi',
      delivery_city: 'Abu Dhabi',
      delivery_notes: 'Test order from local script',
      items: [
        {
          productId: 'test-1',
          productName: 'Test Item 1',
          productNameEn: 'Test Item 1',
          quantity: 1,
          unit: 'kg',
          pricePerUnit: 10,
          totalPrice: 10,
          customerNotes: 'Test note 1',
          category: 'test',
        },
        {
          productId: 'test-2',
          productName: 'Test Item 2',
          productNameEn: 'Test Item 2',
          quantity: 2,
          unit: 'piece',
          pricePerUnit: 5,
          totalPrice: 10,
          customerNotes: 'Test note 2',
          category: 'test',
        }
      ],
      subtotal: 20,
      delivery_fee: 0,
      discount: 0,
      total: 20,
      total_weight: 1,
      order_type: 'delivery',
      scheduled_date: null,
      scheduled_time_slot: null,
      branch_name: null,
    }
  };

  const response = await httpsRequest(
    `${BASE_URL}/api/iiko-create-order`,
    'POST',
    orderPayload
  );

  return response;
}

async function fetchOrderById(token, orderId) {
  const response = await httpsRequest(
    `${IIKO_API_URL}/api/1/deliveries/by_id`,
    'POST',
    {
      organizationId: IIKO_ORG_ID,
      orderIds: [orderId],
    },
    token
  );

  return response;
}

async function checkCommandStatus(token, correlationId) {
  const response = await httpsRequest(
    `${IIKO_API_URL}/api/1/commands/status`,
    'POST',
    {
      organizationId: IIKO_ORG_ID,
      correlationId: correlationId,
    },
    token
  );

  return response;
}

async function run() {
  if (!IIKO_API_LOGIN || !IIKO_ORG_ID) {
    console.error('Missing IIKO_API_LOGIN or IIKO_ORG_ID in .env or environment.');
    process.exit(1);
  }

  console.log(`Creating test order on ${BASE_URL}...`);
  const createResponse = await createTestOrder();
  console.log('Create status:', createResponse.status);

  const createData = createResponse.data || {};
  if (!createData.success || !createData.iikoOrderId) {
    console.log('Create response:', JSON.stringify(createData || createResponse.raw, null, 2));
    process.exit(1);
  }

  const correlationId = createData.correlationId;
  const iikoOrderId = createData.iikoOrderId || createData.clientOrderId;
  const orderNumber = createData.orderNumber || createData.iikoOrderNumber;
  console.log(`Order created. iikoOrderId=${iikoOrderId}, orderNumber=${orderNumber || 'N/A'}`);
  if (correlationId) {
    console.log(`CorrelationId: ${correlationId}`);
  }

  console.log('Fetching order from iiko by ID...');
  const token = await getToken();

  if (correlationId) {
    let statusResponse = await checkCommandStatus(token, correlationId);
    let state = statusResponse.data?.state;
    console.log('Command status:', JSON.stringify(statusResponse.data || statusResponse.raw, null, 2));

    let attempts = 0;
    while (state === 'InProgress' && attempts < 3) {
      attempts += 1;
      await new Promise(resolve => setTimeout(resolve, 2000));
      statusResponse = await checkCommandStatus(token, correlationId);
      state = statusResponse.data?.state;
      console.log(`Command status retry ${attempts}:`, JSON.stringify(statusResponse.data || statusResponse.raw, null, 2));
    }
  }

  const fetchResponse = await fetchOrderById(token, iikoOrderId);
  console.log('Fetch status:', fetchResponse.status);

  const order = fetchResponse.data?.orders?.[0];
  if (!order) {
    console.log('Order not found yet. Raw response:');
    console.log(JSON.stringify(fetchResponse.data || fetchResponse.raw, null, 2));
    process.exit(0);
  }

  console.log('Order found:');
  console.log(JSON.stringify({
    id: order.id,
    number: order.number || order.orderNumber || order.chequeNumber,
    status: order.status,
    sum: order.sum || order.fullSum,
    customer: order.customer?.name,
    phone: order.customer?.phone,
    created: order.whenCreated,
  }, null, 2));
}

run().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
