import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { isPlainObject } from "../_shared/validation.ts";

// Returns all templates visible to the caller based on their scope.
//
// - WAND-level templates (company_key and concept_key both null) are visible
//   to everyone.
// - Company-level templates (company_key set, concept_key null) are visible
//   to anyone whose ccgsContext.companyKey matches.
// - Concept-level templates (both keys set) are visible to anyone whose
//   ccgsContext matches both keys.
// - If no ccgsContext is provided (local server / admin mode), all templates
//   at every scope are returned.

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

  const supabase = createAdminClient();

  let query = supabase
    .from("config_templates")
    .select(
      "id, name, description, company_key, concept_key, theme, background_image_url, title_image_url, footer_logo_url, created_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  const ccgs = isPlainObject(payload.ccgsContext) ? payload.ccgsContext : null;

  if (ccgs) {
    const companyKey =
      ccgs.companyKey != null && ccgs.companyKey !== ""
        ? Number(ccgs.companyKey)
        : null;
    const conceptKey =
      ccgs.conceptKey != null && ccgs.conceptKey !== ""
        ? Number(ccgs.conceptKey)
        : null;

    if (companyKey !== null && conceptKey !== null) {
      // User at concept level: see WAND + their company + their concept.
      query = query.or(
        `company_key.is.null,company_key.eq.${companyKey}.and.concept_key.is.null,company_key.eq.${companyKey}.and.concept_key.eq.${conceptKey}`
      );
    } else if (companyKey !== null) {
      // User at company level: see WAND + their company (concept-level excluded).
      query = query.or(
        `company_key.is.null,company_key.eq.${companyKey}.and.concept_key.is.null`
      );
    } else {
      // No company context: WAND-level only.
      query = query.is("company_key", null);
    }
  }
  // No ccgsContext → admin mode, no filtering.

  const { data: templates, error } = await query;

  if (error) {
    console.error("list-templates: query failed", error);
    return jsonResponse({ error: "Failed to list templates" }, 500);
  }

  return jsonResponse({ templates: templates || [] }, 200);
});
