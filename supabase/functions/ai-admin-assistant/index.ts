import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEASONAL_PRESETS = {
  ramadan: {
    id: "ramadan",
    name_ar: "ثيم رمضان",
    name_en: "Ramadan Theme",
    theme: {
      primary: "45 90% 40%",
      secondary: "25 80% 30%",
      accent: "45 90% 50%",
      accent_dark: "45 85% 55%",
      background: "30 25% 92%",
      background_dark: "25 35% 12%",
      card: "30 30% 95%",
      card_dark: "25 40% 15%",
    },
    banner_gradient_from: "#1a472a",
    banner_gradient_to: "#c5a028",
  },
  eid: {
    id: "eid",
    name_ar: "ثيم العيد",
    name_en: "Eid Theme",
    theme: {
      primary: "140 50% 35%",
      secondary: "45 80% 45%",
      accent: "140 45% 40%",
      accent_dark: "140 50% 45%",
      background: "120 15% 93%",
      background_dark: "140 30% 12%",
      card: "120 20% 96%",
      card_dark: "140 35% 15%",
    },
    banner_gradient_from: "#2d6a4f",
    banner_gradient_to: "#b5838d",
  },
  normal: {
    id: "normal",
    name_ar: "الثيم الأساسي",
    name_en: "Default Theme",
    theme: {
      primary: "7 100% 27%",
      secondary: "0 100% 27%",
      accent: "7 100% 27%",
      accent_dark: "20 80% 45%",
      background: "41 30% 90%",
      background_dark: "0 40% 17%",
      foreground: "0 60% 18%",
      foreground_dark: "41 30% 92%",
      card: "41 35% 94%",
      card_dark: "0 45% 14%",
      muted: "41 20% 85%",
      muted_dark: "0 30% 20%",
    },
    banner_gradient_from: "#8B1100",
    banner_gradient_to: "#3D1A1A",
  },
};

const SYSTEM_PROMPT = `You are an AI admin assistant for Al Saraya Butchery's admin dashboard.
You help administrators manage their store by executing structured actions.

You MUST respond with a valid JSON object (no markdown, no backticks). The JSON must have this structure:
{
  "message": "Human-readable summary of what you'll do (in Arabic + English)",
  "actions": [...array of action objects...],
  "requiresApproval": true/false
}

AVAILABLE ACTIONS:

=== DATA ACTIONS ===

1. UPDATE_PRODUCT - Update product fields
   { "type": "UPDATE_PRODUCT", "productId": "<uuid>", "data": { "price": 50, "name_ar": "...", "name_en": "...", "is_active": true/false } }

2. BULK_PRICE_UPDATE - Change prices by percentage or fixed amount
   { "type": "BULK_PRICE_UPDATE", "filter": { "category": "category-name" }, "adjustment": { "type": "percentage|fixed", "value": 10 } }

3. CREATE_CATEGORY - Create a new category
   { "type": "CREATE_CATEGORY", "data": { "name_ar": "...", "name_en": "...", "slug": "..." } }

4. UPDATE_CATEGORY - Update an existing category
   { "type": "UPDATE_CATEGORY", "categoryId": "<uuid>", "data": { "name_ar": "...", "name_en": "...", "is_active": true/false } }

5. MOVE_PRODUCTS_TO_CATEGORY - Move products to a category
   { "type": "MOVE_PRODUCTS_TO_CATEGORY", "productIds": ["<uuid>"], "categoryId": "<uuid>" }

6. UPDATE_STORE_SETTING - Update a store setting (CMS content, banners, etc.)
   { "type": "UPDATE_STORE_SETTING", "key": "setting_key", "value": { ... } }

7. UPDATE_ORDER_STATUS - Update an order's status
   { "type": "UPDATE_ORDER_STATUS", "orderId": "<uuid>", "status": "confirmed|preparing|ready|out_for_delivery|delivered|cancelled" }

8. QUERY_DATA - Read-only query (auto-applied)
   { "type": "QUERY_DATA", "target": "products|categories|orders|settings|design", "filters": { ... }, "description": "what we're looking for" }

9. UPDATE_SEASONAL_EVENT - Update seasonal event settings
   { "type": "UPDATE_SEASONAL_EVENT", "eventId": "ramadan|eid-fitr|...", "data": { "message_ar": "...", "is_active": true } }

=== DESIGN ACTIONS (NEW) ===

10. UPDATE_DESIGN_THEME - Change colors, fonts, spacing, shadows, border-radius
    { "type": "UPDATE_DESIGN_THEME", "data": { "primary": "7 100% 27%", "font_body": "Tajawal", "border_radius": "0.5rem", "shadow_strength": "medium", "button_radius": "1rem" } }
    
    Color format: HSL values as "H S% L%" string (e.g. "7 100% 27%")
    Available fields: primary, secondary, accent, accent_dark, background, background_dark, foreground, foreground_dark, card, card_dark, muted, muted_dark, font_body, font_display, border_radius, button_radius, shadow_strength, header_height
    shadow_strength options: none, light, medium, strong, dramatic
    
11. UPDATE_SECTION_CONFIG - Show/hide/reorder homepage sections
    { "type": "UPDATE_SECTION_CONFIG", "sections": [{ "id": "hero", "visible": true, "order": 0 }, ...] }
    
    Available section IDs: hero, categories, best-sellers, boxes, how-to-order, special-offers, delivery-payment, testimonials, about-preview, catering-preview, menu-preview, recipes-preview, trust-stats, seo-content, final-cta

12. UPDATE_PRODUCT_CARD - Change product card display settings
    { "type": "UPDATE_PRODUCT_CARD", "data": { "layout": "grid", "card_shape": "square", "columns_desktop": 4, "columns_tablet": 3, "columns_mobile": 2, "show_discount": true, "show_whatsapp": true, "show_add_to_cart": true, "show_old_price": true, "image_size": "medium" } }
    
    layout: grid|list|compact
    card_shape: square|rectangle|rounded
    image_size: small|medium|large

13. ACTIVATE_SEASONAL_THEME - Activate a seasonal theme for banners/sections ONLY
    { "type": "ACTIVATE_SEASONAL_THEME", "themeId": "ramadan|eid|normal" }
    IMPORTANT: This ONLY affects banners and seasonal sections. It does NOT change global site colors.
    The brand identity colors remain unchanged. "normal" disables seasonal mode.

RULES:
- For read-only queries (QUERY_DATA), set requiresApproval: false
- For simple design tweaks (color, font, shadow), set requiresApproval: false (auto-apply safe changes)
- For global layout changes (section reorder, column count), set requiresApproval: true
- For bulk operations affecting >5 items, ALWAYS set requiresApproval: true
- For seasonal theme activation, set requiresApproval: true
- Respond in Arabic primarily since the admin speaks Arabic, with English terms where needed
- If the request is vague like "make it more premium", interpret creatively with appropriate design changes
- NEVER include actions that could delete critical data without explicit confirmation

DESIGN INTERPRETATION GUIDE:
- "فخم" (luxurious) → darker tones, gold accents, serif display font, dramatic shadows
- "بسيط" (simple) → fewer sections, lighter shadows, clean fonts
- "كبر" (bigger) → increase image_size, reduce columns, increase font sizes
- "صغر" (smaller) → decrease sizes, more columns, compact layout
- "رمضاني" (Ramadan) → activate Ramadan theme
- "مربع/مستطيل" (square/rectangle) → change card_shape
- "Shadow" → change shadow_strength

CONTEXT (current database schema):
- products table: id, name_ar, name_en, price, compare_at_price, category, is_active, description_ar, description_en, image_url, is_box, price_per, sort_order
- categories table: id, name_ar, name_en, slug, description_ar, description_en, is_active, sort_order, image_url
- orders table: id, order_number, customer_name, customer_phone, status, total, created_at
- store_settings table: key-value store for CMS content, seasonal events, design settings
- Design settings keys: design_theme, design_sections, design_product_card, active_seasonal_theme
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "owner"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, action, conversationHistory } = await req.json();

    if (action === "execute") {
      const { actions, auditLogId, undoData } = await req.json();
      return await executeActions(supabase, actions, auditLogId, undoData, user.id);
    }

    if (action === "undo") {
      const { auditLogId } = await req.json();
      return await undoActions(supabase, auditLogId, user.id);
    }

    // AI PROMPT MODE
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = await gatherContext(supabase, prompt);

    // Build messages with conversation history for context memory
    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Include up to last 10 conversation turns for context
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === "user") {
          aiMessages.push({ role: "user", content: msg.content });
        } else if (msg.role === "assistant") {
          aiMessages.push({ role: "assistant", content: msg.content });
        }
      }
    }

    // Add current prompt with context
    aiMessages.push({ role: "user", content: `CONTEXT:\n${context}\n\nADMIN REQUEST:\n${prompt}` });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { message: rawContent, actions: [], requiresApproval: true };
    }

    await supabase.from("ai_audit_logs").insert({
      admin_user_id: user.id,
      prompt,
      actions: parsed.actions || [],
      status: "pending",
      result_summary: parsed.message,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function gatherContext(supabase: any, prompt: string): Promise<string> {
  const contextParts: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Always include categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, slug, is_active, sort_order")
    .eq("is_deleted", false)
    .order("sort_order");
  if (categories) {
    contextParts.push(`CATEGORIES (${categories.length} total):\n${JSON.stringify(categories)}`);
  }

  // Products context
  if (lowerPrompt.includes("product") || lowerPrompt.includes("منتج") || lowerPrompt.includes("price") || lowerPrompt.includes("سعر") || lowerPrompt.includes("لحم") || lowerPrompt.includes("دجاج") || lowerPrompt.includes("كارت") || lowerPrompt.includes("card")) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name_ar, name_en, price, category, is_active, is_box, compare_at_price")
      .eq("is_active", true)
      .limit(100);
    if (products) {
      contextParts.push(`ACTIVE PRODUCTS (${products.length}):\n${JSON.stringify(products)}`);
    }
  }

  // Orders context
  if (lowerPrompt.includes("order") || lowerPrompt.includes("طلب") || lowerPrompt.includes("توصيل")) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (orders) {
      contextParts.push(`RECENT ORDERS (${orders.length}):\n${JSON.stringify(orders)}`);
    }
  }

  // Always include design settings for design-related prompts
  const isDesignRelated = lowerPrompt.includes("design") || lowerPrompt.includes("تصميم") || lowerPrompt.includes("لون") || lowerPrompt.includes("color") ||
    lowerPrompt.includes("font") || lowerPrompt.includes("خط") || lowerPrompt.includes("shadow") || lowerPrompt.includes("ظل") ||
    lowerPrompt.includes("فخم") || lowerPrompt.includes("بسيط") || lowerPrompt.includes("كبر") || lowerPrompt.includes("صغر") ||
    lowerPrompt.includes("section") || lowerPrompt.includes("قسم") || lowerPrompt.includes("layout") || lowerPrompt.includes("theme") ||
    lowerPrompt.includes("ثيم") || lowerPrompt.includes("رمضان") || lowerPrompt.includes("عيد") || lowerPrompt.includes("ramadan") ||
    lowerPrompt.includes("eid") || lowerPrompt.includes("card") || lowerPrompt.includes("كارت") || lowerPrompt.includes("هيدر") ||
    lowerPrompt.includes("header") || lowerPrompt.includes("button") || lowerPrompt.includes("زر") || lowerPrompt.includes("شكل") ||
    lowerPrompt.includes("صور") || lowerPrompt.includes("image") || lowerPrompt.includes("premium") || lowerPrompt.includes("مربع") ||
    lowerPrompt.includes("مستطيل") || lowerPrompt.includes("أعمدة") || lowerPrompt.includes("column");

  if (isDesignRelated) {
    const { data: designSettings } = await supabase
      .from("store_settings")
      .select("key, value")
      .in("key", ["design_theme", "design_sections", "design_product_card", "active_seasonal_theme"]);
    if (designSettings) {
      contextParts.push(`CURRENT DESIGN SETTINGS:\n${JSON.stringify(designSettings)}`);
    }
    contextParts.push(`AVAILABLE SEASONAL PRESETS: ${JSON.stringify(Object.keys(SEASONAL_PRESETS))}`);
  }

  // Store settings context
  if (lowerPrompt.includes("setting") || lowerPrompt.includes("إعداد") || lowerPrompt.includes("banner") || lowerPrompt.includes("بانر") || lowerPrompt.includes("seasonal") || lowerPrompt.includes("موسم")) {
    const { data: settings } = await supabase
      .from("store_settings")
      .select("key, value");
    if (settings) {
      contextParts.push(`STORE SETTINGS:\n${JSON.stringify(settings)}`);
    }
  }

  return contextParts.join("\n\n") || "No specific context gathered.";
}

async function upsertStoreSetting(supabase: any, key: string, value: any, merge = false) {
  const { data: existing } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  const oldData = existing || null;
  const finalValue = merge && existing ? { ...(existing.value as any), ...value } : value;

  if (existing) {
    const { error } = await supabase
      .from("store_settings")
      .update({ value: finalValue, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("store_settings")
      .insert({ key, value: finalValue });
    if (error) throw error;
  }

  return oldData;
}

async function executeActions(supabase: any, actions: any[], auditLogId: string, undoData: any, userId: string) {
  const results: any[] = [];
  const errors: string[] = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case "UPDATE_PRODUCT": {
          const { data: old } = await supabase.from("products").select("*").eq("id", action.productId).single();
          const { error } = await supabase.from("products").update(action.data).eq("id", action.productId);
          if (error) throw error;
          results.push({ type: action.type, success: true, oldData: old });
          break;
        }

        case "BULK_PRICE_UPDATE": {
          let query = supabase.from("products").select("id, price, name_ar");
          if (action.filter?.category) query = query.eq("category", action.filter.category);
          const { data: products } = await query;
          if (!products?.length) {
            results.push({ type: action.type, success: false, message: "No products found" });
            break;
          }
          const oldPrices = products.map((p: any) => ({ id: p.id, price: p.price }));
          for (const product of products) {
            let newPrice = product.price;
            if (action.adjustment.type === "percentage") {
              newPrice = Math.round(product.price * (1 + action.adjustment.value / 100) * 100) / 100;
            } else {
              newPrice = product.price + action.adjustment.value;
            }
            await supabase.from("products").update({ price: newPrice }).eq("id", product.id);
          }
          results.push({ type: action.type, success: true, count: products.length, oldPrices });
          break;
        }

        case "CREATE_CATEGORY": {
          const { data, error } = await supabase.from("categories").insert(action.data).select().single();
          if (error) throw error;
          results.push({ type: action.type, success: true, newId: data.id });
          break;
        }

        case "UPDATE_CATEGORY": {
          const { data: old } = await supabase.from("categories").select("*").eq("id", action.categoryId).single();
          const { error } = await supabase.from("categories").update(action.data).eq("id", action.categoryId);
          if (error) throw error;
          results.push({ type: action.type, success: true, oldData: old });
          break;
        }

        case "MOVE_PRODUCTS_TO_CATEGORY": {
          for (const productId of action.productIds) {
            const { data: existing } = await supabase
              .from("product_categories").select("id")
              .eq("product_id", productId).eq("category_id", action.categoryId).maybeSingle();
            if (!existing) {
              await supabase.from("product_categories").insert({ product_id: productId, category_id: action.categoryId });
            }
          }
          results.push({ type: action.type, success: true, count: action.productIds.length });
          break;
        }

        case "UPDATE_STORE_SETTING": {
          const oldData = await upsertStoreSetting(supabase, action.key, action.value);
          results.push({ type: action.type, success: true, oldData, key: action.key });
          break;
        }

        case "UPDATE_ORDER_STATUS": {
          const { data: old } = await supabase.from("orders").select("status").eq("id", action.orderId).single();
          const { error } = await supabase.from("orders").update({ status: action.status }).eq("id", action.orderId);
          if (error) throw error;
          results.push({ type: action.type, success: true, oldStatus: old?.status });
          break;
        }

        case "UPDATE_SEASONAL_EVENT": {
          const { data: settings } = await supabase
            .from("store_settings").select("value").eq("key", "seasonal_events").single();
          if (settings) {
            const events = settings.value as any[];
            const updated = events.map((e: any) => e.id === action.eventId ? { ...e, ...action.data } : e);
            await supabase.from("store_settings")
              .update({ value: updated, updated_at: new Date().toISOString() }).eq("key", "seasonal_events");
          }
          results.push({ type: action.type, success: true });
          break;
        }

        // === NEW DESIGN ACTIONS ===

        case "UPDATE_DESIGN_THEME": {
          const oldData = await upsertStoreSetting(supabase, "design_theme", action.data, true);
          results.push({ type: action.type, success: true, oldData, key: "design_theme" });
          break;
        }

        case "UPDATE_SECTION_CONFIG": {
          const oldData = await upsertStoreSetting(supabase, "design_sections", action.sections);
          results.push({ type: action.type, success: true, oldData, key: "design_sections" });
          break;
        }

        case "UPDATE_PRODUCT_CARD": {
          const oldData = await upsertStoreSetting(supabase, "design_product_card", action.data, true);
          results.push({ type: action.type, success: true, oldData, key: "design_product_card" });
          break;
        }

        case "ACTIVATE_SEASONAL_THEME": {
          const preset = (SEASONAL_PRESETS as any)[action.themeId];
          if (!preset) {
            results.push({ type: action.type, success: false, message: `Unknown theme: ${action.themeId}` });
            break;
          }
          // Seasonal themes only affect banners/seasonal sections, NOT global design_theme
          // Store as active_seasonal_theme for banner/section use only
          const oldSeasonal = await upsertStoreSetting(supabase, "active_seasonal_theme", { id: action.themeId }, true);
          await upsertStoreSetting(supabase, "seasonal_mode_enabled", { enabled: action.themeId !== "normal" });
          results.push({ type: action.type, success: true, oldData: oldSeasonal, key: "active_seasonal_theme", themeId: action.themeId });
          break;
        }

        case "QUERY_DATA": {
          let data: any = null;
          if (action.target === "products") {
            const res = await supabase.from("products").select("id, name_ar, name_en, price, category, is_active").limit(50);
            data = res.data;
          } else if (action.target === "categories") {
            const res = await supabase.from("categories").select("*").eq("is_deleted", false);
            data = res.data;
          } else if (action.target === "orders") {
            const res = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20);
            data = res.data;
          } else if (action.target === "design") {
            const res = await supabase.from("store_settings").select("key, value")
              .in("key", ["design_theme", "design_sections", "design_product_card", "active_seasonal_theme"]);
            data = res.data;
          } else if (action.target === "settings") {
            const res = await supabase.from("store_settings").select("key, value");
            data = res.data;
          }
          results.push({ type: action.type, success: true, data, description: action.description });
          break;
        }

        default:
          results.push({ type: action.type, success: false, message: "Unknown action type" });
      }
    } catch (err: any) {
      errors.push(`${action.type}: ${err.message}`);
      results.push({ type: action.type, success: false, error: err.message });
    }
  }

  if (auditLogId) {
    await supabase
      .from("ai_audit_logs")
      .update({
        status: errors.length > 0 ? "failed" : "applied",
        applied_at: new Date().toISOString(),
        undo_data: JSON.stringify(results),
        error_message: errors.length > 0 ? errors.join("; ") : null,
      })
      .eq("id", auditLogId);
  }

  return new Response(
    JSON.stringify({ success: errors.length === 0, results, errors }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function undoActions(supabase: any, auditLogId: string, userId: string) {
  const { data: log } = await supabase
    .from("ai_audit_logs").select("*").eq("id", auditLogId).single();

  if (!log || log.status !== "applied") {
    return new Response(
      JSON.stringify({ error: "Cannot undo: action not found or not applied" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const undoResults = JSON.parse(log.undo_data || "[]");
  const errors: string[] = [];

  for (const result of undoResults) {
    try {
      if (result.oldData && result.type === "UPDATE_PRODUCT") {
        await supabase.from("products").update(result.oldData).eq("id", result.oldData.id);
      } else if (result.oldPrices && result.type === "BULK_PRICE_UPDATE") {
        for (const p of result.oldPrices) {
          await supabase.from("products").update({ price: p.price }).eq("id", p.id);
        }
      } else if (result.oldData && result.type === "UPDATE_CATEGORY") {
        await supabase.from("categories").update(result.oldData).eq("id", result.oldData.id);
      } else if (result.oldData && (result.type === "UPDATE_STORE_SETTING" || result.type === "UPDATE_DESIGN_THEME" || result.type === "UPDATE_SECTION_CONFIG" || result.type === "UPDATE_PRODUCT_CARD" || result.type === "ACTIVATE_SEASONAL_THEME")) {
        if (result.oldData && result.key) {
          await supabase.from("store_settings").update({ value: result.oldData.value }).eq("key", result.key);
        }
      }
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  await supabase
    .from("ai_audit_logs")
    .update({ status: "undone", undone_at: new Date().toISOString() })
    .eq("id", auditLogId);

  return new Response(
    JSON.stringify({ success: errors.length === 0, errors }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
