/// <reference lib="deno.window" />
// iiko POS API - Fetch External Menus & Products (Admin-only)
// FIXED: Using correct itemCategories response structure
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  baseUrl: "https://api-eu.iiko.services",
};

async function authenticateAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin');

  return (roles?.length || 0) > 0;
}

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

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!await authenticateAdmin(req)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('IIKO_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'IIKO_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getIikoToken(apiKey);
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get iiko token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body
    }

    const action = body.action || 'list_menus';

    // ===== Fetch products from a specific external menu =====
    if (action === 'fetch_menu') {
      const menuId = body.externalMenuId;
      if (!menuId) {
        return new Response(
          JSON.stringify({ success: false, error: 'externalMenuId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`\n[iiko-fetch] === Fetching menu ID: ${menuId} ===`);
      
      let products: any[] = [];
      let groups: any[] = [];
      let source = 'none';

      // PRIMARY STRATEGY: /api/2/menu/by_id - returns itemCategories with items inside
      console.log('[iiko-fetch] Strategy 1: POST /api/2/menu/by_id');
      try {
        const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            organizationIds: [IIKO_CONFIG.organizationId],
            externalMenuId: menuId,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          console.log(`[iiko-fetch] Response status: ${resp.status}`);
          console.log(`[iiko-fetch] Top-level keys: ${Object.keys(data).join(', ')}`);

          // itemCategories is the correct structure
          if (data.itemCategories && Array.isArray(data.itemCategories)) {
            console.log(`[iiko-fetch] Found ${data.itemCategories.length} itemCategories`);
            
            // Process each category - this is where items are stored
            data.itemCategories.forEach((category: any) => {
              if (category.items && category.items.length > 0) {
                console.log(`[iiko-fetch] Category "${category.name}" has ${category.items.length} items`);
                
                // Add category as group
                groups.push({
                  id: category.id,
                  name: category.name,
                });

                // Process items in this category
                category.items.forEach((item: any) => {
                  // Extract price from nested structure: itemSizes[0].prices[0].price
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

            if (products.length > 0) {
              source = 'api2_menu_by_id_itemCategories';
              console.log(`[iiko-fetch] ✓ SUCCESS: Found ${products.length} products in ${groups.length} categories`);
            } else {
              console.log(`[iiko-fetch] ✗ No products found - all categories are empty`);
            }
          }
        }
      } catch (e) {
        console.error('[iiko-fetch] Strategy 1 exception:', e instanceof Error ? e.message : String(e));
      }

      console.log(`\n[iiko-fetch] === Final Result ===`);
      console.log(`[iiko-fetch] Products: ${products.length}, Groups: ${groups.length}, Source: ${source}`);

      return new Response(
        JSON.stringify({ 
          success: products.length > 0,
          action: 'fetch_menu',
          externalMenuId: menuId,
          source,
          products,
          groups,
          totalProducts: products.length,
          totalGroups: groups.length,
          message: products.length === 0 
            ? `No products found in menu categories` 
            : `Found ${products.length} products`,
        }),
        { 
          status: products.length > 0 ? 200 : 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ===== List available external menus =====
    console.log('[iiko-fetch] === Listing external menus ===');
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        organizationIds: [IIKO_CONFIG.organizationId],
        externalMenuId: null
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[iiko-fetch] Failed to fetch menus:', response.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `iiko API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const externalMenus = (data.externalMenus || []).map((m: any) => ({
      id: m.id,
      name: m.name,
    }));

    console.log(`[iiko-fetch] Found ${externalMenus.length} external menus`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: 'list_menus',
        externalMenus,
        totalMenus: externalMenus.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[iiko-fetch] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
