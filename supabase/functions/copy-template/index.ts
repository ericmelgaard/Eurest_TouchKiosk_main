import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { isPlainObject, normalizeStoreKey } from "../_shared/validation.ts";

// Two modes:
// 1. Copy from another store (sourceStoreKey) — the original behavior.
// 2. Import from a saved template (templateId) — reads config_template +
//    config_template_cards and applies them to the target store.
//
// In both modes only the "look" fields are copied; the target keeps its own
// store/company/concept identity.
//
// Access rules for template import:
// - CCGS mode: caller may only import templates within their scope.
// - No CCGS context (admin mode): any template may be imported.
Deno.serve(async (req: Request) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const targetStoreKey = normalizeStoreKey(payload.targetStoreKey);
  if (!targetStoreKey) {
    return jsonResponse({ error: "targetStoreKey is required" }, 400);
  }

  const templateId =
    typeof payload.templateId === "string" && payload.templateId.trim()
      ? payload.templateId.trim()
      : null;

  const sourceStoreKey = normalizeStoreKey(payload.sourceStoreKey);

  if (!templateId && !sourceStoreKey) {
    return jsonResponse({ error: "Either templateId or sourceStoreKey is required" }, 400);
  }
  if (templateId && sourceStoreKey) {
    return jsonResponse({ error: "Provide either templateId or sourceStoreKey, not both" }, 400);
  }
  if (sourceStoreKey && sourceStoreKey === targetStoreKey) {
    return jsonResponse({ error: "sourceStoreKey and targetStoreKey must differ" }, 400);
  }

  const supabase = createAdminClient();
  const ccgs = isPlainObject(payload.ccgsContext) ? payload.ccgsContext : null;

  let sourceTheme: Record<string, unknown> | null = null;
  let sourceBackgroundImageUrl: string | null = null;
  let sourceTitleImageUrl: string | null = null;
  let sourceBehavior: Record<string, unknown> | null = null;
  let sourceCards: Record<string, unknown>[] = [];

  if (templateId) {
    // --- Import from template ---
    const { data: template, error: tplError } = await supabase
      .from("config_templates")
      .select("company_key, concept_key, theme, background_image_url, title_image_url, behavior")
      .eq("id", templateId)
      .maybeSingle();

    if (tplError) {
      console.error("copy-template: read template failed", tplError);
      return jsonResponse({ error: "Failed to read template" }, 500);
    }
    if (!template) {
      return jsonResponse({ error: "Template not found" }, 404);
    }

    // Access check for template import.
    if (ccgs) {
      const callerCompany =
        ccgs.companyKey != null && ccgs.companyKey !== ""
          ? Number(ccgs.companyKey)
          : null;
      const callerConcept =
        ccgs.conceptKey != null && ccgs.conceptKey !== ""
          ? Number(ccgs.conceptKey)
          : null;

      const tplCompany = template.company_key;
      const tplConcept = template.concept_key;

      if (tplCompany !== null && tplCompany !== callerCompany) {
        return jsonResponse({ error: "Not allowed to import this template" }, 403);
      }
      if (tplConcept !== null && tplConcept !== callerConcept) {
        return jsonResponse({ error: "Not allowed to import this template" }, 403);
      }
    }

    sourceTheme = template.theme;
    sourceBackgroundImageUrl = template.background_image_url;
    sourceTitleImageUrl = template.title_image_url;
    sourceBehavior = template.behavior;

    const { data: tplCards, error: tplCardsError } = await supabase
      .from("config_template_cards")
      .select("sort_order, name, active, icon_url, icon_source, destination_type, destination_value, colors")
      .eq("template_id", templateId)
      .order("sort_order", { ascending: true });
    if (tplCardsError) {
      console.error("copy-template: read template cards failed", tplCardsError);
      return jsonResponse({ error: "Failed to read template" }, 500);
    }
    sourceCards = tplCards || [];
  } else {
    // --- Copy from another store (original behavior) ---
    const { data: sourceConfig, error: sourceConfigError } = await supabase
      .from("site_config")
      .select("theme, background_image_url, title_image_url, behavior")
      .eq("store_key", sourceStoreKey)
      .maybeSingle();
    if (sourceConfigError) {
      console.error("copy-template: read source site_config failed", sourceConfigError);
      return jsonResponse({ error: "Failed to read source location" }, 500);
    }
    if (!sourceConfig) {
      return jsonResponse({ error: "Source location has no saved config" }, 404);
    }

    sourceTheme = sourceConfig.theme;
    sourceBackgroundImageUrl = sourceConfig.background_image_url;
    sourceTitleImageUrl = sourceConfig.title_image_url;
    sourceBehavior = sourceConfig.behavior;

    const { data: srcCards, error: srcCardsError } = await supabase
      .from("category_cards")
      .select("sort_order, name, active, icon_url, icon_source, destination_type, destination_value, colors")
      .eq("store_key", sourceStoreKey)
      .order("sort_order", { ascending: true });
    if (srcCardsError) {
      console.error("copy-template: read source category_cards failed", srcCardsError);
      return jsonResponse({ error: "Failed to read source location" }, 500);
    }
    sourceCards = srcCards || [];
  }

  // Apply to target: upsert site_config look fields.
  const { error: upsertError } = await supabase
    .from("site_config")
    .upsert(
      {
        store_key: targetStoreKey,
        theme: sourceTheme,
        background_image_url: sourceBackgroundImageUrl,
        title_image_url: sourceTitleImageUrl,
        behavior: sourceBehavior,
        updated_at: new Date().toISOString(),
        updated_by: typeof payload.updatedBy === "string" ? payload.updatedBy : null,
      },
      { onConflict: "store_key" },
    );
  if (upsertError) {
    console.error("copy-template: upsert target site_config failed", upsertError);
    return jsonResponse({ error: "Failed to apply template" }, 500);
  }

  // Replace target category cards.
  const { error: deleteError } = await supabase
    .from("category_cards")
    .delete()
    .eq("store_key", targetStoreKey);
  if (deleteError) {
    console.error("copy-template: delete target category_cards failed", deleteError);
    return jsonResponse({ error: "Failed to apply template" }, 500);
  }

  if (sourceCards.length) {
    const newRows = sourceCards.map((card) => ({
      store_key: targetStoreKey,
      sort_order: card.sort_order,
      name: card.name,
      active: card.active,
      icon_url: card.icon_url,
      icon_source: card.icon_source,
      destination_type: card.destination_type,
      destination_value: card.destination_value,
      colors: card.colors,
    }));
    const { error: insertError } = await supabase.from("category_cards").insert(newRows);
    if (insertError) {
      console.error("copy-template: insert target category_cards failed", insertError);
      return jsonResponse({ error: "Failed to apply template" }, 500);
    }
  }

  return jsonResponse({ ok: true }, 200);
});
