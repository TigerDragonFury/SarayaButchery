// iiko POS API - Fetch Menu (Admin-only endpoint)
// SECURED: Requires admin authentication

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IIKO_CONFIG = {
  organizationId: "32d5187a-c03f-4b28-8c7f-901e91dc639c",
  baseUrl: "https://api-eu.iiko.services",
};

// Authenticate admin request
async function authenticateAdmin(req: Request): Promise<{ userId: string; isAdmin: boolean } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin');

  return { userId: user.id, isAdmin: (roles?.length || 0) > 0 };
}

async function getIikoToken(apiKey: string): Promise<{ token: string | null; error: string | null }> {
  try {
    const response = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { token: null, error: `Token failed: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { token: data.token, error: null };
  } catch (err) {
    return { token: null, error: `Token error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // AUTHENTICATION CHECK - Require admin
    const auth = await authenticateAdmin(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - requires admin role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('IIKO_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'IIKO_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get token
    const { token, error: tokenError } = await getIikoToken(apiKey);
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: tokenError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const terminalGroupId = "c7d35f12-dd03-c268-0173-09bb2e4900ce";
    const results: Record<string, any> = {};

    // Method 1: /api/1/nomenclature (current)
    try {
      const r1 = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/nomenclature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ organizationId: IIKO_CONFIG.organizationId, startRevision: 0 }),
      });
      const d1 = await r1.json();
      results.nomenclature_v1 = {
        status: r1.status,
        productsCount: d1.products?.length || 0,
        groupsCount: d1.groups?.length || 0,
        categoriesCount: d1.productCategories?.length || 0,
        revision: d1.revision,
        keys: Object.keys(d1),
        sampleProduct: d1.products?.[0] || null,
        sampleGroup: d1.groups?.[0] || null,
        categories: d1.productCategories || [],
      };
    } catch (e) { results.nomenclature_v1 = { error: String(e) }; }

    // Method 2: /api/2/menu
    try {
      const r2 = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          externalMenuId: null,
          organizationIds: [IIKO_CONFIG.organizationId],
          priceCategoryId: null,
        }),
      });
      const d2 = r2.ok ? await r2.json() : await r2.text();
      results.menu_v2 = { status: r2.status, data: typeof d2 === 'string' ? d2.substring(0, 2000) : { 
        itemCategoriesCount: d2.itemCategories?.length || 0,
        itemsCount: d2.itemCategories?.reduce((sum: number, c: any) => sum + (c.items?.length || 0), 0) || 0,
        keys: Object.keys(d2),
        categories: d2.itemCategories?.map((c: any) => ({ name: c.name, itemsCount: c.items?.length || 0 })) || [],
        sampleItem: d2.itemCategories?.[0]?.items?.[0] || null,
      }};
    } catch (e) { results.menu_v2 = { error: String(e) }; }

    // Method 3: /api/2/menu/by_id
    try {
      const r3 = await fetch(`${IIKO_CONFIG.baseUrl}/api/2/menu/by_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          externalMenuId: null,
          organizationIds: [IIKO_CONFIG.organizationId],
          priceCategoryId: null,
        }),
      });
      const d3Text = await r3.text();
      results.menu_v2_by_id = { status: r3.status, response: d3Text.substring(0, 1000) };
    } catch (e) { results.menu_v2_by_id = { error: String(e) }; }

    // Method 4: /api/1/terminal_groups
    try {
      const r4 = await fetch(`${IIKO_CONFIG.baseUrl}/api/1/terminal_groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ organizationIds: [IIKO_CONFIG.organizationId] }),
      });
      const d4 = r4.ok ? await r4.json() : await r4.text();
      results.terminal_groups = { status: r4.status, data: d4 };
    } catch (e) { results.terminal_groups = { error: String(e) }; }

    return new Response(
      JSON.stringify({ success: true, organizationId: IIKO_CONFIG.organizationId, terminalGroupId, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
