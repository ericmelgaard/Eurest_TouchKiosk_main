import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { normalizeStoreKey } from "../_shared/validation.ts";

// Explicit "copy template" action: materializes a full copy of another accessible
// location's config (site_config + category_cards) into the current store's row.
// This is a one-time copy, not a live cascade - the target keeps its own identity fields.
Deno.serve(async (req) => {
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

  const sourceStoreKey = normalizeStoreKey(payload.sourceStoreKey);
  const targetStoreKey = normalizeStoreKey(payload.targetStoreKey);
  if (!sourceStoreKey || !targetStoreKey) {
    return jsonResponse({ error: "sourceStoreKey and targetStoreKey are required" }, 400);
  }
  if (sourceStoreKey === targetStoreKey) {
    return jsonResponse({ error: "sourceStoreKey and targetStoreKey must differ" }, 400);
  }

  const supabase = createAdminClient();

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

  const { data: sourceCards, error: sourceCardsError } = await supabase
    .from("category_cards")
    .select("sort_order, name, active, icon_url, icon_source, destination_type, destination_value, colors")
    .eq("store_key", sourceStoreKey)
    .order("sort_order", { ascending: true });
  if (sourceCardsError) {
    console.error("copy-template: read source category_cards failed", sourceCardsError);
    return jsonResponse({ error: "Failed to read source location" }, 500);
  }

  // Only the "look" fields are copied - target keeps its own store/company/concept identity.
  const { error: upsertError } = await supabase
    .from("site_config")
    .upsert(
      {
        store_key: targetStoreKey,
        theme: sourceConfig.theme,
        background_image_url: sourceConfig.background_image_url,
        title_image_url: sourceConfig.title_image_url,
        behavior: sourceConfig.behavior,
        updated_at: new Date().toISOString(),
        updated_by: typeof payload.updatedBy === "string" ? payload.updatedBy : null,
      },
      { onConflict: "store_key" },
    );
  if (upsertError) {
    console.error("copy-template: upsert target site_config failed", upsertError);
    return jsonResponse({ error: "Failed to apply template" }, 500);
  }

  const { error: deleteError } = await supabase
    .from("category_cards")
    .delete()
    .eq("store_key", targetStoreKey);
  if (deleteError) {
    console.error("copy-template: delete target category_cards failed", deleteError);
    return jsonResponse({ error: "Failed to apply template" }, 500);
  }

  if (sourceCards && sourceCards.length) {
    const newRows = sourceCards.map((card) => ({ ...card, store_key: targetStoreKey }));
    const { error: insertError } = await supabase.from("category_cards").insert(newRows);
    if (insertError) {
      console.error("copy-template: insert target category_cards failed", insertError);
      return jsonResponse({ error: "Failed to apply template" }, 500);
    }
  }

  return jsonResponse({ ok: true }, 200);
});
