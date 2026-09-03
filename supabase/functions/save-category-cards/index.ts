import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import {
  CARD_COLOR_KEYS,
  isDestinationType,
  isIconSource,
  isNonEmptyString,
  isPlainObject,
  isPlausibleAssetUrl,
  isPlausibleCssColor,
  normalizeStoreKey,
} from "../_shared/validation.ts";

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

  const storeKey = normalizeStoreKey(payload.storeKey);
  if (!storeKey) {
    return jsonResponse({ error: "storeKey is required" }, 400);
  }

  const cards = Array.isArray(payload.cards) ? payload.cards : null;
  if (!cards) {
    return jsonResponse({ error: "cards must be an array" }, 400);
  }

  const rows = [];
  for (const card of cards) {
    if (!isNonEmptyString(card?.name)) {
      return jsonResponse({ error: "Each card requires a non-empty name" }, 400);
    }
    const destType = isDestinationType(card?.destinationType) ? card.destinationType : "trm_layer";
    const destValue = isNonEmptyString(card?.destinationValue) ? card.destinationValue : "";
    if (destType === "iframe" && destValue && !isPlausibleAssetUrl(destValue)) {
      return jsonResponse({ error: `Card "${card.name}" iframe destination must be an http(s) URL` }, 400);
    }
    if (card?.iconUrl != null && !isPlausibleAssetUrl(card.iconUrl)) {
      return jsonResponse({ error: `Card "${card.name}" iconUrl must be an http(s) URL` }, 400);
    }
    const iconSource = isIconSource(card?.iconSource) ? card.iconSource : "catalog";

    const colors: Record<string, string> = {};
    if (card?.colors != null) {
      if (!isPlainObject(card.colors)) {
        return jsonResponse({ error: `Card "${card.name}" colors must be an object` }, 400);
      }
      for (const [key, value] of Object.entries(card.colors)) {
        if (!(CARD_COLOR_KEYS as readonly string[]).includes(key)) {
          continue;
        }
        if (!isPlausibleCssColor(value)) {
          return jsonResponse({ error: `Card "${card.name}" colors.${key} is not a plausible CSS color` }, 400);
        }
        colors[key] = value as string;
      }
    }

    rows.push({
      store_key: storeKey,
      sort_order: Number.isFinite(card?.sortOrder) ? card.sortOrder : rows.length,
      name: card.name,
      active: card?.active !== false,
      icon_url: card?.iconUrl ?? null,
      icon_source: iconSource,
      destination_type: destType,
      destination_value: destValue,
      colors,
      updated_at: new Date().toISOString(),
    });
  }

  const supabase = createAdminClient();

  // Ensure the parent site_config row exists so category_cards' FK doesn't reject the insert.
  const { error: siteConfigError } = await supabase
    .from("site_config")
    .upsert({ store_key: storeKey }, { onConflict: "store_key", ignoreDuplicates: true });
  if (siteConfigError) {
    console.error("save-category-cards: ensure site_config failed", siteConfigError);
    return jsonResponse({ error: "Failed to save category cards" }, 500);
  }

  const { error: deleteError } = await supabase
    .from("category_cards")
    .delete()
    .eq("store_key", storeKey);
  if (deleteError) {
    console.error("save-category-cards: delete failed", deleteError);
    return jsonResponse({ error: "Failed to save category cards" }, 500);
  }

  if (!rows.length) {
    return jsonResponse({ categoryCards: [] }, 200);
  }

  const { data, error: insertError } = await supabase
    .from("category_cards")
    .insert(rows)
    .select();
  if (insertError) {
    console.error("save-category-cards: insert failed", insertError);
    return jsonResponse({ error: "Failed to save category cards" }, 500);
  }

  return jsonResponse({ categoryCards: data }, 200);
});
