// Vercel Serverless Function - Fetch iiko Menu & Products
import { createClient } from '@supabase/supabase-js';

const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  baseUrl: "https://api-eu.iiko.services",
};

async function authenticateAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const supabaseService = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin');

  return (roles?.length || 0) > 0;
}

async function getIikoToken(apiKey) {
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

async function fetchMenuProducts(token, menuId) {
  const products = [];
  const groups = [];

  try {
    const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationIds: [IIKO_CONFIG.organizationId],
        externalMenuId: menuId,
      }),
    });

    if (!resp.ok) return { products, groups, source: 'none' };

    const data = await resp.json();

    if (data.itemCategories && Array.isArray(data.itemCategories)) {
      data.itemCategories.forEach((category) => {
        if (category.items && category.items.length > 0) {
          groups.push({
            id: category.id,
            name: category.name,
          });

          category.items.forEach((item) => {
            let price = null;
            if (item.itemSizes && item.itemSizes.length > 0) {
              const firstSize = item.itemSizes[0];
              if (firstSize.prices && firstSize.prices.length > 0) {
                price = firstSize.prices[0].price;
              }
            }

            products.push({
              id: item.sku || item.id,
              name: item.name,
              price: price,
              groupId: category.id,
              groupName: category.name,
            });
          });
        }
      });
    }

    return { products, groups, source: 'api2_menu_by_id_itemCategories' };
  } catch (e) {
    console.error('Error fetching menu:', e);
    return { products, groups, source: 'none' };
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Authenticate admin
    if (!await authenticateAdmin(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const apiKey = process.env.IIKO_API_LOGIN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'IIKO_API_LOGIN not configured' });
    }

    const body = req.method === 'POST' ? req.body : {};
    const action = body.action || 'list_menus';

    // Fetch products from a specific menu
    if (action === 'fetch_menu') {
      const menuId = body.externalMenuId;
      if (!menuId) {
        return res.status(400).json({ success: false, error: 'externalMenuId is required' });
      }

      const token = await getIikoToken(apiKey);
      if (!token) {
        return res.status(500).json({ success: false, error: 'Failed to authenticate with iiko' });
      }

      const { products, groups, source } = await fetchMenuProducts(token, menuId);

      return res.status(products.length > 0 ? 200 : 404).json({
        success: products.length > 0,
        action: 'fetch_menu',
        externalMenuId: menuId,
        source,
        products,
        groups,
        totalProducts: products.length,
        totalGroups: groups.length,
        message: products.length === 0
          ? 'No products found in menu categories'
          : `Found ${products.length} products`,
      });
    }

    // List external menus
    if (action === 'list_menus') {
      const token = await getIikoToken(apiKey);
      if (!token) {
        return res.status(500).json({ success: false, error: 'Failed to authenticate with iiko' });
      }

      try {
        const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            organizationIds: [IIKO_CONFIG.organizationId],
          }),
        });

        if (!resp.ok) {
          return res.status(resp.status).json({ success: false, error: 'Failed to fetch menus from iiko' });
        }

        const data = await resp.json();
        const menus = data.externalMenus || [];

        return res.status(200).json({
          success: true,
          action: 'list_menus',
          externalMenus: menus,
          totalMenus: menus.length,
        });
      } catch (e) {
        return res.status(500).json({ success: false, error: 'Error fetching menus: ' + e.message });
      }
    }

    return res.status(400).json({ success: false, error: 'Unknown action' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
