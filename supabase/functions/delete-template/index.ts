import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { isPlainObject } from "../_shared/validation.ts";

// Deletes a template and its associated cards (cascade handles cards).
//
// Access rules (same as save-template):
// - CCGS mode: caller may only delete templates within their scope.
// - No CCGS context (admin mode): any template may be deleted.

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

  const templateId =
    typeof payload.templateId === "string" && payload.templateId.trim()
      ? payload.templateId.trim()
      : null;
  if (!templateId) {
    return jsonResponse({ error: "templateId is required" }, 400);
  }

  const supabase = createAdminClient();

  // Fetch the template to check its scope.
  const { data: template, error: fetchError } = await supabase
    .from("config_templates")
    .select("company_key, concept_key")
    .eq("id", templateId)
    .maybeSingle();

  if (fetchError) {
    console.error("delete-template: fetch failed", fetchError);
    return jsonResponse({ error: "Failed to delete template" }, 500);
  }
  if (!template) {
    return jsonResponse({ error: "Template not found" }, 404);
  }

  // Access check.
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

    const tplCompany = template.company_key;
    const tplConcept = template.concept_key;

    // WAND-level templates: anyone in CCGS mode can delete.
    if (tplCompany !== null || tplConcept !== null) {
      if (tplCompany !== null && tplCompany !== callerCompany) {
        return jsonResponse({ error: "Not allowed to delete this template" }, 403);
      }
      if (tplConcept !== null && tplConcept !== callerConcept) {
        return jsonResponse({ error: "Not allowed to delete this template" }, 403);
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("config_templates")
    .delete()
    .eq("id", templateId);

  if (deleteError) {
    console.error("delete-template: delete failed", deleteError);
    return jsonResponse({ error: "Failed to delete template" }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
