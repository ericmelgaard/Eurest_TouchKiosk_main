import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  createAdminClient,
  KIOSK_ASSETS_BUCKET,
} from "../_shared/supabaseAdmin.ts";
import { isNonEmptyString, normalizeStoreKey } from "../_shared/validation.ts";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const PURPOSES = ["icon-catalog", "custom-icon", "background", "title"] as const;
type Purpose = typeof PURPOSES[number];

function isPurpose(value: unknown): value is Purpose {
  return typeof value === "string" && (PURPOSES as readonly string[]).includes(value);
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (_err) {
    return jsonResponse({ error: "Expected multipart/form-data body" }, 400);
  }

  const purpose = form.get("purpose");
  if (!isPurpose(purpose)) {
    return jsonResponse({ error: "purpose must be one of: " + PURPOSES.join(", ") }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "file is required" }, 400);
  }
  if (file.size > MAX_FILE_BYTES) {
    return jsonResponse({ error: "file exceeds 5MB limit" }, 400);
  }
  const extension = ALLOWED_CONTENT_TYPES[file.type];
  if (!extension) {
    return jsonResponse({ error: "unsupported file type: " + file.type }, 400);
  }

  const storeKey = normalizeStoreKey(form.get("storeKey"));
  const conceptKeyRaw = form.get("conceptKey");
  const conceptKey = conceptKeyRaw != null ? Number(conceptKeyRaw) : NaN;
  const label = form.get("label");

  let path: string;
  if (purpose === "icon-catalog") {
    if (!Number.isFinite(conceptKey)) {
      return jsonResponse({ error: "conceptKey is required for purpose=icon-catalog" }, 400);
    }
    path = `icons/catalog/${conceptKey}/${crypto.randomUUID()}.${extension}`;
  } else if (purpose === "custom-icon") {
    if (!storeKey) {
      return jsonResponse({ error: "storeKey is required for purpose=custom-icon" }, 400);
    }
    path = `icons/custom/${storeKey}/${crypto.randomUUID()}.${extension}`;
  } else {
    if (!storeKey) {
      return jsonResponse({ error: "storeKey is required for purpose=" + purpose }, 400);
    }
    path = `branding/${storeKey}/${purpose}-${Date.now()}.${extension}`;
  }

  const supabase = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(KIOSK_ASSETS_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error("upload-asset: storage upload failed", uploadError);
    return jsonResponse({ error: "Failed to upload asset" }, 500);
  }

  const { data: publicUrlData } = supabase.storage.from(KIOSK_ASSETS_BUCKET).getPublicUrl(path);
  const iconUrl = publicUrlData.publicUrl;

  if (purpose === "icon-catalog") {
    const { data, error } = await supabase
      .from("icon_catalog")
      .insert({
        concept_key: conceptKey,
        label: isNonEmptyString(label) ? label : "Untitled icon",
        icon_url: iconUrl,
        sort_order: 0,
      })
      .select()
      .single();
    if (error) {
      console.error("upload-asset: icon_catalog insert failed", error);
      return jsonResponse({ error: "Uploaded file, but failed to register catalog icon" }, 500);
    }
    return jsonResponse({ url: iconUrl, iconCatalogEntry: data }, 200);
  }

  return jsonResponse({ url: iconUrl }, 200);
});
