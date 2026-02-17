// iiko POS API - Fetch External Menus & Products for Product Linking (Admin-only)
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

    // Parse request body to check for action
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body = list external menus
    }

    const action = body.action || 'list_menus';

    // STEP 1: List available external menus
    if (action === 'list_menus') {
      const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          organizationId: IIKO_CONFIG.organizationId 
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('iiko /api/2/menu error:', response.status, errText);
        return new Response(
          JSON.stringify({ success: false, error: `iiko API error: ${response.status} - ${errText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('External menus response:', JSON.stringify(data).substring(0, 500));

      // data.externalMenus is an array of { id, name }
      const externalMenus = (data.externalMenus || []).map((m: any) => ({
        id: m.id,
        name: m.name,
      }));

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

    // STEP 2: Fetch products from a specific external menu
    if (action === 'fetch_menu') {
      const externalMenuId = body.externalMenuId;
      let products: any[] = [];
      let groups: any[] = [];
      let source = 'unknown';

      // Strategy 1: Try /api/2/menu/by_id (may fail on EU servers)
      try {
        console.log('Strategy 1: /api/2/menu/by_id with externalMenuId:', externalMenuId);
        const menuResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            organizationIds: [IIKO_CONFIG.organizationId],
            externalMenuId: externalMenuId,
          }),
        });

        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          console.log('Strategy 1 OK. Keys:', Object.keys(menuData), 'itemCategories:', (menuData.itemCategories || []).length);

          const itemCategories = menuData.itemCategories || [];
          for (const cat of itemCategories) {
            groups.push({ id: cat.id, name: cat.name });
            for (const item of (cat.items || [])) {
              products.push({
                id: item.itemId || item.id,
                name: item.name,
                code: item.code || null,
                price: item.itemSizes?.[0]?.prices?.[0]?.price ?? item.price ?? null,
                groupId: cat.id,
                groupName: cat.name,
                description: item.description || null,
              });
            }
          }
          source = 'external_menu_v2';
        } else {
          const errText = await menuResponse.text();
          console.warn('Strategy 1 failed:', menuResponse.status, errText.substring(0, 200));
        }
      } catch (e) {
        console.warn('Strategy 1 exception:', e instanceof Error ? e.message : e);
      }

      // Strategy 2: Try /api/2/menu to get full menu data (includes items)
      if (products.length === 0) {
        try {
          console.log('Strategy 2: /api/2/menu (full response)');
          const menuResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              organizationId: IIKO_CONFIG.organizationId,
            }),
          });

          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            const keys = Object.keys(menuData);
            console.log('Strategy 2 response keys:', keys);
            // Log first 1000 chars of response for debugging
            const rawStr = JSON.stringify(menuData);
            console.log('Strategy 2 raw (first 1500 chars):', rawStr.substring(0, 1500));
            
            // Check various possible structures
            if (menuData.itemCategories) {
              for (const cat of menuData.itemCategories) {
                groups.push({ id: cat.id, name: cat.name });
                for (const item of (cat.items || [])) {
                  products.push({
                    id: item.itemId || item.id,
                    name: item.name,
                    price: item.itemSizes?.[0]?.prices?.[0]?.price ?? item.price ?? null,
                    groupId: cat.id,
                    groupName: cat.name,
                  });
                }
              }
              source = 'menu_v2_full';
            }
          } else {
            console.warn('Strategy 2 failed:', menuResponse.status);
          }
        } catch (e) {
          console.warn('Strategy 2 exception:', e instanceof Error ? e.message : e);
        }
      }

      // Strategy 3: Nomenclature API fallback
      if (products.length === 0) {
        console.log('Strategy 3: /api/1/nomenclature');
        const nomResponse = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ organizationId: IIKO_CONFIG.organizationId }),
        });

        if (nomResponse.ok) {
          const nomData = await nomResponse.json();
          console.log('Strategy 3: products=', (nomData.products || []).length, 'groups=', (nomData.groups || []).length);

          const groupMap = new Map<string, string>();
          (nomData.groups || []).forEach((g: any) => {
            groupMap.set(g.id, g.name);
          });

          products = (nomData.products || [])
            .filter((p: any) => !p.isDeleted)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code || null,
              price: p.sizePrices?.[0]?.price?.currentPrice ?? null,
              groupId: p.parentGroup || null,
              groupName: p.parentGroup ? groupMap.get(p.parentGroup) || 'Unknown' : 'No Group',
              description: p.description || null,
            }));

          groups = (nomData.groups || [])
            .filter((g: any) => !g.isDeleted)
            .map((g: any) => ({ id: g.id, name: g.name }));

          source = 'nomenclature_v1';
        } else {
          const errText = await nomResponse.text();
          console.error('Strategy 3 error:', nomResponse.status, errText.substring(0, 300));
          return new Response(
            JSON.stringify({ success: false, error: `All iiko APIs returned 0 products` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          action: 'fetch_menu',
          source,
          externalMenuId: externalMenuId || null,
          products, 
          groups,
          totalProducts: products.length,
          totalGroups: groups.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // FALLBACK: old nomenclature method
    if (action === 'nomenclature') {
      const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ organizationId: IIKO_CONFIG.organizationId, startRevision: 0 }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ success: false, error: `iiko API error: ${response.status} - ${errText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const groupMap = new Map<string, string>();
      (data.groups || []).forEach((g: any) => {
        groupMap.set(g.id, g.name);
      });

      const products = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code || null,
        price: p.sizePrices?.[0]?.price?.currentPrice ?? null,
        groupId: p.parentGroup || null,
        groupName: p.parentGroup ? groupMap.get(p.parentGroup) || 'Unknown' : 'No Group',
        type: p.type,
        isDeleted: p.isDeleted || false,
      })).filter((p: any) => !p.isDeleted);

      const groups = (data.groups || [])
        .filter((g: any) => !g.isDeleted)
        .map((g: any) => ({
          id: g.id,
          name: g.name,
          parentGroup: g.parentGroup || null,
        }));

      return new Response(
        JSON.stringify({ success: true, action: 'nomenclature', products, groups, totalProducts: products.length, totalGroups: groups.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
