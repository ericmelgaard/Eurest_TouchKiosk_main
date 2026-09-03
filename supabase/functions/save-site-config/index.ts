import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import {
  isInactivityTarget,
  isMsInRange,
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

  const theme = isPlainObject(payload.theme) ? payload.theme : {};
  for (const [key, value] of Object.entries(theme)) {
    if (!isPlausibleCssColor(value)) {
      return jsonResponse({ error: `theme.${key} is not a plausible CSS color` }, 400);
    }
  }

  if (payload.backgroundImageUrl != null && !isPlausibleAssetUrl(payload.backgroundImageUrl)) {
    return jsonResponse({ error: "backgroundImageUrl must be an http(s) URL" }, 400);
  }
  if (payload.titleImageUrl != null && !isPlausibleAssetUrl(payload.titleImageUrl)) {
    return jsonResponse({ error: "titleImageUrl must be an http(s) URL" }, 400);
  }

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

  const row = {
    store_key: storeKey,
    company_key: payload.companyKey != null ? Number(payload.companyKey) : null,
    concept_key: payload.conceptKey != null ? Number(payload.conceptKey) : null,
    company_name: typeof payload.companyName === "string" ? payload.companyName : null,
    concept_name: typeof payload.conceptName === "string" ? payload.conceptName : null,
    store_name: typeof payload.storeName === "string" ? payload.storeName : null,
    theme,
    background_image_url: payload.backgroundImageUrl ?? null,
    title_image_url: payload.titleImageUrl ?? null,
    behavior,
    updated_at: new Date().toISOString(),
    updated_by: typeof payload.updatedBy === "string" ? payload.updatedBy : null,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_config")
    .upsert(row, { onConflict: "store_key" })
    .select()
    .single();

  if (error) {
    console.error("save-site-config: upsert failed", error);
    return jsonResponse({ error: "Failed to save site config" }, 500);
  }

  return jsonResponse({ siteConfig: data }, 200);
});
