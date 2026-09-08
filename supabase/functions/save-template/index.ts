import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import {
  CARD_COLOR_KEYS,
  isDestinationType,
  isIconSource,
  isInactivityTarget,
  isMsInRange,
  isNonEmptyString,
  isPlainObject,
  isPlausibleAssetUrl,
  isPlausibleCssColor,
} from "../_shared/validation.ts";

// Saves the current site's look-and-feel (theme, branding images, behavior, and
// category cards) as a reusable template at WAND, Company, or Concept scope.
//
// Access rules:
// - If ccgsContext is provided (Content Forecaster mode), the caller may only
//   save at a scope matching their company_key / concept_key.
// - If ccgsContext is absent (local server / admin mode), any scope is allowed,
//   including WAND-level (both keys null).

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

  const name = isNonEmptyString(payload.name) ? payload.name.trim() : null;
  if (!name) {
    return jsonResponse({ error: "name is required" }, 400);
  }

  const description =
    typeof payload.description === "string" ? payload.description.trim() : null;

  // Scope keys — both null means WAND-level.
  const companyKey =
    payload.companyKey != null && payload.companyKey !== ""
      ? Number(payload.companyKey)
      : null;
  const conceptKey =
    payload.conceptKey != null && payload.conceptKey !== ""
      ? Number(payload.conceptKey)
      : null;

  if (companyKey !== null && !Number.isFinite(companyKey)) {
    return jsonResponse({ error: "companyKey must be a number or null" }, 400);
  }
  if (conceptKey !== null && !Number.isFinite(conceptKey)) {
    return jsonResponse({ error: "conceptKey must be a number or null" }, 400);
  }
  // Concept-level template requires a company key.
  if (conceptKey !== null && companyKey === null) {
    return jsonResponse({ error: "conceptKey requires a companyKey" }, 400);
  }

  // Access check: in CCGS mode, the scope must match the caller's context.
  const ccgs = isPlainObject(payload.ccgsContext) ? payload.ccgsContext : null;
  if (ccgs) {
    const callerCompany =
      ccgs.companyKey != null && ccgs.companyKey !== ""
        ? Number(ccgs.companyKey)
        : null;
    const callerConcept =
      ccgs.conceptKey != null && ccgs.conceptKey !== ""
        ? Number(ccgs.conceptKey)
        : null;

    if (companyKey !== null && companyKey !== callerCompany) {
      return jsonResponse({ error: "Not allowed to save at this company scope" }, 403);
    }
    if (conceptKey !== null && conceptKey !== callerConcept) {
      return jsonResponse({ error: "Not allowed to save at this concept scope" }, 403);
    }
  }

  // Validate theme colors.
  const themeInput = isPlainObject(payload.theme) ? payload.theme : {};
  const theme: Record<string, string> = {};
  for (const [key, value] of Object.entries(themeInput)) {
    if (!isPlausibleCssColor(value)) {
      return jsonResponse({ error: `theme.${key} is not a plausible CSS color` }, 400);
    }
    theme[key] = value as string;
  }

  // Validate branding URLs.
  if (payload.backgroundImageUrl != null && !isPlausibleAssetUrl(payload.backgroundImageUrl)) {
    return jsonResponse({ error: "backgroundImageUrl must be an http(s) URL" }, 400);
  }
  if (payload.titleImageUrl != null && !isPlausibleAssetUrl(payload.titleImageUrl)) {
    return jsonResponse({ error: "titleImageUrl must be an http(s) URL" }, 400);
  }

  // Validate behavior.
  const behaviorInput = isPlainObject(payload.behavior) ? payload.behavior : {};
  const behavior: Record<string, unknown> = {};
  if (behaviorInput.inactivityWarningDelayMs != null) {
    if (!isMsInRange(behaviorInput.inactivityWarningDelayMs, 1000, 600000)) {
      return jsonResponse({ error: "behavior.inactivityWarningDelayMs must be between 1000 and 600000" }, 400);
    }
    behavior.inactivityWarningDelayMs = behaviorInput.inactivityWarningDelayMs;
  }
  if (behaviorInput.inactivityCountdownMs != null) {
    if (!isMsInRange(behaviorInput.inactivityCountdownMs, 1000, 120000)) {
      return jsonResponse({ error: "behavior.inactivityCountdownMs must be between 1000 and 120000" }, 400);
    }
    behavior.inactivityCountdownMs = behaviorInput.inactivityCountdownMs;
  }
  if (behaviorInput.homeIdleDelayMs != null) {
    if (!isMsInRange(behaviorInput.homeIdleDelayMs, 1000, 600000)) {
      return jsonResponse({ error: "behavior.homeIdleDelayMs must be between 1000 and 600000" }, 400);
    }
    behavior.homeIdleDelayMs = behaviorInput.homeIdleDelayMs;
  }
  if (behaviorInput.inactivityTargetPage != null) {
    if (!isInactivityTarget(behaviorInput.inactivityTargetPage)) {
      return jsonResponse({ error: "behavior.inactivityTargetPage must be 'home' or 'idle'" }, 400);
    }
    behavior.inactivityTargetPage = behaviorInput.inactivityTargetPage;
  }

  // Validate category cards.
  const cards = Array.isArray(payload.cards) ? payload.cards : [];
  const cardRows: Record<string, unknown>[] = [];
  for (const card of cards) {
    if (!isNonEmptyString(card?.name)) {
      return jsonResponse({ error: "Each card requires a non-empty name" }, 400);
    }
    const destType = isDestinationType(card?.destinationType)
      ? card.destinationType
      : "trm_layer";
    const destValue = isNonEmptyString(card?.destinationValue)
      ? card.destinationValue
      : "";
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
        if (!(CARD_COLOR_KEYS as readonly string[]).includes(key)) continue;
        if (!isPlausibleCssColor(value)) {
          return jsonResponse({ error: `Card "${card.name}" colors.${key} is not a plausible CSS color` }, 400);
        }
        colors[key] = value as string;
      }
    }

    cardRows.push({
      sort_order: Number.isFinite(card?.sortOrder) ? card.sortOrder : cardRows.length,
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

  const { data: templateRow, error: templateError } = await supabase
    .from("config_templates")
    .insert({
      name,
      description,
      company_key: companyKey,
      concept_key: conceptKey,
      theme,
      background_image_url: payload.backgroundImageUrl ?? null,
      title_image_url: payload.titleImageUrl ?? null,
      behavior,
      updated_by: typeof payload.updatedBy === "string" ? payload.updatedBy : null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (templateError || !templateRow) {
    console.error("save-template: insert failed", templateError);
    return jsonResponse({ error: "Failed to save template" }, 500);
  }

  if (cardRows.length) {
    const rowsWithTemplateId = cardRows.map((r) => ({
      ...r,
      template_id: templateRow.id,
    }));
    const { error: cardsError } = await supabase
      .from("config_template_cards")
      .insert(rowsWithTemplateId);
    if (cardsError) {
      console.error("save-template: insert cards failed", cardsError);
      // Clean up the orphaned template row.
      await supabase.from("config_templates").delete().eq("id", templateRow.id);
      return jsonResponse({ error: "Failed to save template cards" }, 500);
    }
  }

  return jsonResponse({ ok: true, templateId: templateRow.id }, 200);
});
