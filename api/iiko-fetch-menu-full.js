const IIKO_API_URL = 'https://api-eu.iiko.services';
const IIKO_ORG_ID = '32d5187a-c03f-4b28-8c7f-901e91dc639c';

async function getIikoToken(apiKey) {
  try {
    const response = await fetch(`${IIKO_API_URL}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.token || null;
  } catch (err) {
    console.error('Token error:', err.message);
    return null;
  }
}

async function fetchMenuProducts(token, menuId) {
  const products = [];
  const groups = [];

  try {
    const resp = await fetch(`${IIKO_API_URL}/api/2/menu/by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationIds: [IIKO_ORG_ID],
        externalMenuId: menuId,
      }),
    });

    console.log(`[iiko] Menu response status: ${resp.status}`);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[iiko] Menu fetch failed: ${resp.status} - ${errorText}`);
      return { products: [], groups: [], source: 'none' };
    }

    const data = await resp.json();
    console.log('[iiko] Menu data received, categories:', data.itemCategories?.length || 0);

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

    console.log(`[iiko] Found ${products.length} products in ${groups.length} categories`);
    return { products, groups, source: 'api2_menu_by_id_itemCategories' };
  } catch (e) {
    console.error('[iiko] Menu fetch error:', e.message);
    return { products: [], groups: [], source: 'none' };
  }
}

async function fetchExternalMenus(token) {
  try {
    console.log('[iiko] Fetching external menus...');
    
    const resp = await fetch(`${IIKO_API_URL}/api/2/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationIds: [IIKO_ORG_ID],
      }),
    });

    if (!resp.ok) {
      console.log(`[iiko] Menus fetch failed: ${resp.status}`);
      return [];
    }

    const data = await resp.json();
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

      const { products, groups, source } = await fetchMenuProducts(token, menuId);

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
