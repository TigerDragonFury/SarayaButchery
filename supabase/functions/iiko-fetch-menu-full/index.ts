// iiko POS API - Fetch External Menus & Products for Product Linking (Admin-only)
// Based on successful implementation from AlSaraya project
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
      // No body = list external menus by default
    }

    const action = body.action || 'list_menus';

    // ===== ACTION: List all available external menus =====
    if (action === 'list_menus') {
      console.log('[iiko] Fetching list of external menus...');
      
      const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          organizationIds: [IIKO_CONFIG.organizationId],
          externalMenuId: null  // null = list all menus
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[iiko] /api/2/menu error:', response.status, errText);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to fetch menus: ${response.status}` }),
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

      console.log(`[iiko] Found ${externalMenus.length} external menus`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          action: 'list_menus',
          externalMenus,
          totalMenus: externalMenus.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== ACTION: Fetch products from a specific external menu =====
    if (action === 'fetch_menu') {
      const externalMenuId = body.externalMenuId;
      if (!externalMenuId) {
        return new Response(
          JSON.stringify({ success: false, error: 'externalMenuId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[iiko] Fetching menu with ID: ${externalMenuId}`);
      
      let products: any[] = [];
      let groups: any[] = [];
      let source = 'unknown';

      // Strategy 1: Use /api/2/menu/by_id (structured response)
      try {
        console.log('[iiko] Strategy 1: /api/2/menu/by_id');
        const menuResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            organizationIds: [IIKO_CONFIG.organizationId],
            externalMenuId: externalMenuId,
          }),
        });

        if (menuResponse.ok) {
          const menuData: any = await menuResponse.json();

          // Handle structure: groups + products with parentGroup links
          if (menuData.groups && menuData.products) {
            console.log('[iiko] Strategy 1: Direct groups/products structure');
            groups = (menuData.groups || []).map((g: any) => ({
              id: g.id,
              name: g.name,
            }));

            products = (menuData.products || [])
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.sizePrices?.[0]?.price?.currentPrice ?? p.sizePrices?.[0]?.price ?? null,
                groupId: p.parentGroup || null,
                groupName: groups.find(g => g.id === p.parentGroup)?.name || 'Uncategorized',
              }));

            source = 'menu_by_id_v2';
            console.log(`[iiko] Strategy 1 SUCCESS: ${products.length} products, ${groups.length} groups`);
          }
        }
      } catch (e) {
        console.warn('[iiko] Strategy 1 exception:', e instanceof Error ? e.message : String(e));
      }

      // Strategy 2: Use /api/2/menu with externalMenuId
      if (products.length === 0) {
        try {
          console.log('[iiko] Strategy 2: /api/2/menu with externalMenuId');
          const menuResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              organizationIds: [IIKO_CONFIG.organizationId],
              externalMenuId: externalMenuId,
            }),
          });

          if (menuResponse.ok) {
            const menuData: any = await menuResponse.json();

            // Handle structure: externalMenus array with itemGroups
            if (menuData.externalMenus && menuData.externalMenus.length > 0) {
              const menu = menuData.externalMenus[0];
              const itemGroups = menu.itemGroups || [];

              groups = itemGroups.map((ig: any) => ({
                id: ig.id,
                name: ig.name,
              }));

              products = itemGroups.flatMap((ig: any) =>
                (ig.items || []).map((item: any) => ({
                  id: item.itemId || item.id,
                  name: item.name,
                  price: item.itemSizes?.[0]?.prices?.[0]?.price ?? null,
                  groupId: ig.id,
                  groupName: ig.name,
                }))
              );

              source = 'menu_v2_external_menus';
              console.log(`[iiko] Strategy 2 SUCCESS: ${products.length} products, ${groups.length} groups`);
            }
          }
        } catch (e) {
          console.warn('[iiko] Strategy 2 exception:', e instanceof Error ? e.message : String(e));
        }
      }

      // Strategy 3: Fallback to nomenclature API (all organization products)
      if (products.length === 0) {
        try {
          console.log('[iiko] Strategy 3: /api/1/nomenclature fallback');
          const nomResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ organizationId: IIKO_CONFIG.organizationId }),
          });

          if (nomResponse.ok) {
            const nomData: any = await nomResponse.json();
            const allGroups = nomData.groups || [];
            const allProducts = nomData.products || [];

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
                groupName: groups.find(g => g.id === p.parentGroup)?.name || 'Uncategorized',
              }));

            source = 'nomenclature_v1_fallback';
            console.log(`[iiko] Strategy 3 SUCCESS: ${products.length} products`);
          }
        } catch (e) {
          console.warn('[iiko] Strategy 3 exception:', e instanceof Error ? e.message : String(e));
        }
      }

      return new Response(
        JSON.stringify({ 
          success: products.length > 0,
          action: 'fetch_menu',
          source,
          externalMenuId,
          products, 
          groups,
          totalProducts: products.length,
          totalGroups: groups.length,
          message: products.length === 0 
            ? `No products found for menu ${externalMenuId}. Check Supabase logs.` 
            : `Found ${products.length} products in ${groups.length} categories`,
        }),
        { 
          status: products.length > 0 ? 200 : 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[iiko] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
