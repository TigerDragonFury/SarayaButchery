const IIKO_API_URL = 'https://api-eu.iiko.services';
const IIKO_ORG_ID = '32d5187a-c03f-4b28-8c7f-901e91dc639c';

import https from 'https';
import { URL } from 'url';

function httpsRequest(url, method, data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          console.error(`[parse error] Invalid JSON from ${method} ${urlObj.pathname}`);
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getIikoToken(apiKey) {
  try {
    console.log('[token] Requesting...');
    const data = await httpsRequest(
      `${IIKO_API_URL}/api/1/access_token`,
      'POST',
      { apiLogin: apiKey }
    );
    
    if (!data || !data.token) {
      console.error('[token] No token in response');
      return null;
    }
    
    console.log('[token] Got token: YES');
    return data.token;
  } catch (err) {
    console.error(`[token] ERROR: ${err.message}`);
    return null;
  }
}

async function fetchMenuProducts(token, menuId) {
  const products = [];
  const groups = [];

  try {
    console.log(`[fetch] Getting menu ${menuId}...`);
    
    const data = await httpsRequest(
      `${IIKO_API_URL}/api/2/menu/by_id`,
      'POST',
      {
        organizationIds: [IIKO_ORG_ID],
        externalMenuId: menuId,
      },
      token
    );

    if (!data) {
      console.error('[fetch] No data returned');
      return { products: [], groups: [], source: 'none' };
    }

    console.log(`[fetch] Got ${data.itemCategories?.length || 0} categories`);

    if (data.itemCategories && Array.isArray(data.itemCategories)) {
      data.itemCategories.forEach((category) => {
        if (category.items && Array.isArray(category.items) && category.items.length > 0) {
          groups.push({
            id: category.id,
            name: category.name || '',
          });

          category.items.forEach((item) => {
            let price = null;
            if (item.itemSizes && Array.isArray(item.itemSizes) && item.itemSizes.length > 0) {
              const firstSize = item.itemSizes[0];
              if (firstSize.prices && Array.isArray(firstSize.prices) && firstSize.prices.length > 0) {
                price = firstSize.prices[0].price;
              }
            }

            products.push({
              id: item.sku || item.id || '',
              name: item.name || '',
              price: price,
              groupId: category.id,
              groupName: category.name || '',
            });
          });
        }
      });
    }

    console.log(`[fetch] Extracted ${products.length} products in ${groups.length} groups`);
    return { products, groups, source: 'api2_menu_by_id_itemCategories' };
  } catch (e) {
    console.error(`[ERROR] Menu fetch: ${e.message}`);
    return { products: [], groups: [], source: 'none' };
  }
}

async function fetchExternalMenus(token) {
  try {
    console.log('[iiko] Fetching external menus...');
    
    const data = await httpsRequest(
      `${IIKO_API_URL}/api/2/menu`,
      'POST',
      { organizationIds: [IIKO_ORG_ID] },
      token
    );

    if (!data) {
      console.log('[iiko] No menus data returned');
      return [];
    }

    const menus = data.externalMenus || [];
    console.log(`[iiko] Found ${menus.length} external menus`);
    return menus;
  } catch (e) {
    console.error('[iiko] Menus fetch error:', e.message);
    return [];
  }
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`\n[${new Date().toISOString()}] ${req.method} /api/iiko-fetch-menu-full`);

    const apiKey = process.env.IIKO_API_LOGIN;
    if (!apiKey) {
      console.error('[error] IIKO_API_LOGIN not configured in Vercel');
      return res.status(500).json({
        success: false,
        error: 'IIKO_API_LOGIN not configured'
      });
    }
    console.log('[handler] IIKO_API_LOGIN is configured');

    let body = {};
    if (req.method === 'POST') {
      try {
        body = req.body || {};
        console.log('[handler] Request body:', JSON.stringify(body));
      } catch (e) {
        console.error('[handler] Error parsing body:', e.message);
      }
    }

    const action = body.action || 'list_menus';
    console.log('[handler] Action:', action);

    const token = await getIikoToken(apiKey);
    if (!token) {
      console.error('[error] Failed to get iiko token');
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with iiko API'
      });
    }

    if (action === 'fetch_menu') {
      const menuId = body.externalMenuId;
      if (!menuId) {
        return res.status(400).json({
          success: false,
          error: 'externalMenuId is required'
        });
      }

      // Convert to number if it's a string
      const menuIdNum = typeof menuId === 'string' ? parseInt(menuId, 10) : menuId;
      console.log(`[handler] Fetching menu ${menuId} (as ${menuIdNum})`);
      
      const { products, groups, source } = await fetchMenuProducts(token, menuIdNum);

      return res.status(200).json({
        success: true,
        action: 'fetch_menu',
        externalMenuId: menuId,
        source,
        products,
        groups,
        totalProducts: products.length,
        totalGroups: groups.length,
      });
    }

    if (action === 'list_menus') {
      const menus = await fetchExternalMenus(token);

      return res.status(200).json({
        success: true,
        action: 'list_menus',
        externalMenus: menus,
        totalMenus: menus.length,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Unknown action',
      supportedActions: ['list_menus', 'fetch_menu']
    });
  } catch (err) {
    console.error('[error] API exception:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}

export default handler;
