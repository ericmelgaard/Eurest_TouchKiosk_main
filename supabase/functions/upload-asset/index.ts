import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  createAdminClient,
  KIOSK_ASSETS_BUCKET,
  buildPublicUrl,
} from "../_shared/supabaseAdmin.ts";
import { isNonEmptyString, normalizeStoreKey } from "../_shared/validation.ts";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const PURPOSES = ["icon-catalog", "custom-icon", "background", "title"] as const;
type Purpose = (typeof PURPOSES)[number];

function isPurpose(v: unknown): v is Purpose {
  return typeof v === "string" && (PURPOSES as readonly string[]).includes(v);
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const ct = req.headers.get("content-type") || "";

    let file: File | null = null;
    let purpose = "custom-icon";
    let storeKey = "0";
    let conceptKey: string | null = null;
    let label = "";

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      file = fd.get("file") as File | null;
      purpose = (fd.get("purpose") as string) || purpose;
      storeKey = (fd.get("storeKey") as string) || storeKey;
      conceptKey = fd.get("conceptKey") as string | null;
      label = (fd.get("label") as string) || "";
    } else {
      const body = await req.json();
      purpose = body.purpose || purpose;
      storeKey = body.storeKey || storeKey;
      conceptKey = body.conceptKey ?? null;
      label = body.label || "";

      if (typeof body.fileBase64 === "string" && body.fileBase64.length) {
        const bin = atob(body.fileBase64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const ctype = body.contentType || "image/png";
        file = new File([bytes], "upload." + (ALLOWED_TYPES[ctype] || "png"), { type: ctype });
      }
    }

    if (!file || file.size === 0) {
      return jsonResponse({ error: "No file provided" }, 400);
    }

    if (file.size > MAX_FILE_BYTES) {
      return jsonResponse({ error: "File exceeds 5 MB limit" }, 400);
    }

    if (!isPurpose(purpose)) {
      return jsonResponse({ error: "purpose must be one of: " + PURPOSES.join(", ") }, 400);
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return jsonResponse({ error: "Unsupported file type: " + file.type }, 400);
    }

    const sk = normalizeStoreKey(storeKey);
    const ck = conceptKey != null ? Number(conceptKey) : NaN;
    const id = crypto.randomUUID();

    let path: string;
    if (purpose === "icon-catalog") {
      if (!Number.isFinite(ck)) return jsonResponse({ error: "conceptKey required for icon-catalog" }, 400);
      path = `icons/catalog/${ck}/${id}.${extension}`;
    } else if (purpose === "custom-icon") {
      if (!sk) return jsonResponse({ error: "storeKey required for custom-icon" }, 400);
      path = `icons/custom/${sk}/${id}.${extension}`;
    } else {
      if (!sk) return jsonResponse({ error: "storeKey required for " + purpose }, 400);
      path = `branding/${sk}/${purpose}-${Date.now()}.${extension}`;
    }

    const supabase = createAdminClient();
    const arrayBuf = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(KIOSK_ASSETS_BUCKET)
      .upload(path, arrayBuf, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("upload-asset: storage error", JSON.stringify(uploadError));
      return jsonResponse({ error: "Storage upload failed: " + uploadError.message }, 500);
    }

    const iconUrl = buildPublicUrl(path);

    if (purpose === "icon-catalog") {
      const { data, error } = await supabase
        .from("icon_catalog")
        .insert({
          concept_key: ck,
          label: isNonEmptyString(label) ? label : "Untitled icon",
          icon_url: iconUrl,
          sort_order: 0,
        })
        .select()
        .single();
      if (error) {
        console.error("upload-asset: icon_catalog insert failed", error);
        return jsonResponse({ error: "Uploaded but failed to register catalog icon" }, 500);
      }
      return jsonResponse({ url: iconUrl, iconCatalogEntry: data }, 200);
    }

    return jsonResponse({ url: iconUrl }, 200);
  } catch (err) {
    console.error("upload-asset: unhandled", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
