// iiko POS API - Fetch External Menus & Products (Admin-only)
// Enhanced with detailed debugging logs
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

Deno.serve(async (req) => {
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
      let debugInfo: any = {};

      // Strategy 1: /api/2/menu with externalMenuId
      console.log('[iiko-fetch] Strategy 1: POST /api/2/menu (with externalMenuId)');
      try {
        const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            organizationIds: [IIKO_CONFIG.organizationId],
            externalMenuId: menuId,
          }),
        });

        const text = await resp.text();
        console.log(`[iiko-fetch] Strategy 1 Response (Status ${resp.status})`);
        console.log(`[iiko-fetch] Response length: ${text.length} bytes`);
        console.log(`[iiko-fetch] First 2000 chars: ${text.substring(0, 2000)}`);

        if (resp.ok && text) {
          const data = JSON.parse(text);
          debugInfo.strategy1 = {
            status: resp.status,
            keys: Object.keys(data),
            hasExternalMenus: !!data.externalMenus,
            externalMenusCount: data.externalMenus?.length || 0,
          };

          if (data.externalMenus && data.externalMenus.length > 0) {
            const menu = data.externalMenus[0];
            console.log(`[iiko-fetch] Found external menu. Keys:`, Object.keys(menu));
            console.log(`[iiko-fetch] Menu structure:`, {
              id: menu.id,
              name: menu.name,
              itemGroupsCount: menu.itemGroups?.length || 0,
              hasExternalMenuItems: !!menu.items,
              itemsCount: menu.items?.length || 0,
            });

            // Try itemGroups
            if (menu.itemGroups && menu.itemGroups.length > 0) {
              console.log(`[iiko-fetch] Using itemGroups structure (${menu.itemGroups.length} groups)`);
              
              groups = menu.itemGroups.map((ig: any) => ({
                id: ig.id,
                name: ig.name,
              }));

              products = menu.itemGroups.flatMap((ig: any) =>
                (ig.items || []).map((item: any) => ({
                  id: item.itemId || item.id,
                  name: item.name,
                  price: item.itemSizes?.[0]?.prices?.[0]?.price ?? null,
                  groupId: ig.id,
                  groupName: ig.name,
                }))
              );

              source = 'api2_menu_external_menus_itemgroups';
              console.log(`[iiko-fetch] ✓ Strategy 1 SUCCESS: ${products.length} products, ${groups.length} groups`);
            }
            // Try items directly
            else if (menu.items && menu.items.length > 0) {
              console.log(`[iiko-fetch] Using items array (${menu.items.length} items)`);
              products = menu.items.map((item: any) => ({
                id: item.itemId || item.id,
                name: item.name,
                price: item.itemSizes?.[0]?.prices?.[0]?.price ?? null,
                groupId: null,
                groupName: 'Uncategorized',
              }));
              groups = [];
              source = 'api2_menu_external_menus_items';
              console.log(`[iiko-fetch] ✓ Strategy 1 SUCCESS: ${products.length} products`);
            }
          }
        }
      } catch (e) {
        console.error('[iiko-fetch] Strategy 1 exception:', e instanceof Error ? e.message : String(e));
        debugInfo.strategy1Error = e instanceof Error ? e.message : String(e);
      }

      // Strategy 2: /api/2/menu/by_id
      if (products.length === 0) {
        console.log('\n[iiko-fetch] Strategy 2: POST /api/2/menu/by_id');
        try {
          const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              organizationIds: [IIKO_CONFIG.organizationId],
              externalMenuId: menuId,
            }),
          });

          const text = await resp.text();
          console.log(`[iiko-fetch] Strategy 2 Response (Status ${resp.status}), length: ${text.length}`);
          console.log(`[iiko-fetch] First 1500 chars: ${text.substring(0, 1500)}`);

          if (resp.ok && text) {
            const data = JSON.parse(text);
            debugInfo.strategy2 = {
              status: resp.status,
              keys: Object.keys(data),
              hasGroups: !!data.groups,
              hasProducts: !!data.products,
              groupsCount: data.groups?.length || 0,
              productsCount: data.products?.length || 0,
            };

            if (data.groups && data.products && data.products.length > 0) {
              console.log(`[iiko-fetch] Using groups/products structure`);
              groups = data.groups.map((g: any) => ({
                id: g.id,
                name: g.name,
              }));

              products = data.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.sizePrices?.[0]?.price?.currentPrice ?? null,
                groupId: p.parentGroup || null,
                groupName: groups.find((g: any) => g.id === p.parentGroup)?.name || 'Uncategorized',
              }));

              source = 'api2_menu_by_id';
              console.log(`[iiko-fetch] ✓ Strategy 2 SUCCESS: ${products.length} products, ${groups.length} groups`);
            }
          }
        } catch (e) {
          console.error('[iiko-fetch] Strategy 2 exception:', e instanceof Error ? e.message : String(e));
          debugInfo.strategy2Error = e instanceof Error ? e.message : String(e);
        }
      }

      // Strategy 3: /api/1/nomenclature (fallback - ALL organization products)
      if (products.length === 0) {
        console.log('\n[iiko-fetch] Strategy 3: POST /api/1/nomenclature (fallback)');
        try {
          const resp = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ organizationId: IIKO_CONFIG.organizationId }),
          });

          const text = await resp.text();
          console.log(`[iiko-fetch] Strategy 3 Response (Status ${resp.status}), length: ${text.length}`);

          if (resp.ok && text) {
            const data = JSON.parse(text);
            debugInfo.strategy3 = {
              status: resp.status,
              keys: Object.keys(data),
              groupsCount: data.groups?.length || 0,
              productsCount: data.products?.length || 0,
            };

            const allGroups = data.groups || [];
            const allProducts = data.products || [];

            groups = allGroups
              .filter((g: any) => !g.isDeleted)
              .map((g: any) => ({
                id: g.id,
                name: g.name,
              }));

            products = allProducts
              .filter((p: any) => !p.isDeleted)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.sizePrices?.[0]?.price?.currentPrice ?? null,
                groupId: p.parentGroup || null,
                groupName: groups.find((g: any) => g.id === p.parentGroup)?.name || 'Uncategorized',
              }));

            source = 'api1_nomenclature_fallback';
            console.log(`[iiko-fetch] ✓ Strategy 3 SUCCESS: ${products.length} products (from all organization)`);
          }
        } catch (e) {
          console.error('[iiko-fetch] Strategy 3 exception:', e instanceof Error ? e.message : String(e));
          debugInfo.strategy3Error = e instanceof Error ? e.message : String(e);
        }
      }

      console.log(`\n[iiko-fetch] === Final Result ===`);
      console.log(`[iiko-fetch] Products: ${products.length}`);
      console.log(`[iiko-fetch] Groups: ${groups.length}`);
      console.log(`[iiko-fetch] Source: ${source}`);
      console.log(`[iiko-fetch] Debug Info:`, JSON.stringify(debugInfo));

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
          debugInfo: debugInfo,
          message: products.length === 0 
            ? `❌ No products found. Check function logs for details.` 
            : `✓ Found ${products.length} products`,
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
      itemGroupsCount: (m.itemGroups || []).length,
      totalItems: (m.itemGroups || []).reduce((sum: number, g: any) => 
        sum + (g.items?.length || 0), 0),
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
