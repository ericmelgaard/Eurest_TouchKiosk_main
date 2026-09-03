import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  buildPublicUrl,
  createAdminClient,
  KIOSK_ASSETS_BUCKET,
} from "../_shared/supabaseAdmin.ts";
import { isNonEmptyString, normalizeStoreKey } from "../_shared/validation.ts";

const PURPOSES = ["background", "title", "custom-icon", "icon-catalog"] as const;
type Purpose = typeof PURPOSES[number];

function isPurpose(value: unknown): value is Purpose {
  return typeof value === "string" && (PURPOSES as readonly string[]).includes(value);
}

// Deletes an uploaded asset and clears any site_config/icon_catalog row still pointing at it.
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

  const path = payload.path;
  const purpose = payload.purpose;
  if (!isNonEmptyString(path) || path.includes("..")) {
    return jsonResponse({ error: "path is required and must not contain .." }, 400);
  }
  if (!isPurpose(purpose)) {
    return jsonResponse({ error: "purpose must be one of: " + PURPOSES.join(", ") }, 400);
  }

  // Scope every delete to the caller's own store/concept folder - never an arbitrary path.
  let expectedPrefix = "";
  let storeKey: string | null = null;
  let conceptKey: number | null = null;

  if (purpose === "background" || purpose === "title") {
    storeKey = normalizeStoreKey(payload.storeKey);
    if (!storeKey) {
      return jsonResponse({ error: "storeKey is required for purpose=" + purpose }, 400);
    }
    expectedPrefix = `branding/${storeKey}/`;
  } else if (purpose === "custom-icon") {
    storeKey = normalizeStoreKey(payload.storeKey);
    if (!storeKey) {
      return jsonResponse({ error: "storeKey is required for purpose=custom-icon" }, 400);
    }
    expectedPrefix = `icons/custom/${storeKey}/`;
  } else {
    conceptKey = payload.conceptKey != null ? Number(payload.conceptKey) : NaN;
    if (!Number.isFinite(conceptKey)) {
      return jsonResponse({ error: "conceptKey is required for purpose=icon-catalog" }, 400);
    }
    expectedPrefix = `icons/catalog/${conceptKey}/`;
  }

  if (!path.startsWith(expectedPrefix)) {
    return jsonResponse({ error: "path is not within the expected scope for this purpose" }, 400);
  }

  const supabase = createAdminClient();
  const { error: removeError } = await supabase.storage.from(KIOSK_ASSETS_BUCKET).remove([path]);
  if (removeError) {
    console.error("delete-asset: storage remove failed", removeError);
    return jsonResponse({ error: "Failed to delete asset" }, 500);
  }

  const publicUrl = buildPublicUrl(path);

  if ((purpose === "background" || purpose === "title") && storeKey) {
    const column = purpose === "background" ? "background_image_url" : "title_image_url";
    const { data: site, error: siteError } = await supabase
      .from("site_config")
      .select(column)
      .eq("store_key", storeKey)
      .maybeSingle();
    if (!siteError && site && (site as Record<string, unknown>)[column] === publicUrl) {
      await supabase.from("site_config").update({ [column]: null }).eq("store_key", storeKey);
    }
  }

  if (purpose === "icon-catalog") {
    await supabase.from("icon_catalog").delete().eq("icon_url", publicUrl);
  }

  return jsonResponse({ ok: true }, 200);
});
