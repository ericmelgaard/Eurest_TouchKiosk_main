import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { isNonEmptyString } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();

    if (body.purpose !== "icon-catalog") {
      return jsonResponse({ error: "This endpoint only handles icon-catalog metadata registration" }, 400);
    }

    const iconUrl = body.iconUrl;
    if (!isNonEmptyString(iconUrl)) {
      return jsonResponse({ error: "iconUrl is required" }, 400);
    }

    const conceptKey = body.conceptKey != null ? Number(body.conceptKey) : NaN;
    if (!Number.isFinite(conceptKey)) {
      return jsonResponse({ error: "conceptKey is required" }, 400);
    }

    const label = isNonEmptyString(body.label) ? body.label : "Untitled icon";

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("icon_catalog")
      .insert({ concept_key: conceptKey, label, icon_url: iconUrl, sort_order: 0 })
      .select()
      .single();

    if (error) {
      console.error("upload-asset: icon_catalog insert failed", error);
      return jsonResponse({ error: "Failed to register catalog icon: " + error.message }, 500);
    }

    return jsonResponse({ iconCatalogEntry: data }, 200);
  } catch (err) {
    console.error("upload-asset: unhandled error", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
