import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  createAdminClient,
  KIOSK_ASSETS_BUCKET,
  buildPublicUrl,
} from "../_shared/supabaseAdmin.ts";
import { isNonEmptyString, normalizeStoreKey } from "../_shared/validation.ts";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const PURPOSES = ["icon-catalog", "custom-icon", "background", "title"] as const;
type Purpose = (typeof PURPOSES)[number];

function isPurpose(value: unknown): value is Purpose {
  return typeof value === "string" && (PURPOSES as readonly string[]).includes(value);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();

    const purpose = body.purpose;
    if (!isPurpose(purpose)) {
      return jsonResponse({ error: "purpose must be one of: " + PURPOSES.join(", ") }, 400);
    }

    const contentType = typeof body.contentType === "string" ? body.contentType : "";
    const extension = ALLOWED_CONTENT_TYPES[contentType];
    if (!extension) {
      return jsonResponse({ error: "Unsupported contentType: " + contentType }, 400);
    }

    const fileBase64 = body.fileBase64;
    if (typeof fileBase64 !== "string" || !fileBase64.length) {
      return jsonResponse({ error: "fileBase64 is required" }, 400);
    }

    let bytes: Uint8Array;
    try {
      bytes = base64ToBytes(fileBase64);
    } catch (_) {
      return jsonResponse({ error: "Invalid base64 data" }, 400);
    }

    if (bytes.length > MAX_FILE_BYTES) {
      return jsonResponse({ error: "File exceeds 5 MB limit" }, 400);
    }

    const storeKey = normalizeStoreKey(body.storeKey);
    const conceptKey = body.conceptKey != null ? Number(body.conceptKey) : NaN;
    const label = body.label;

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Direct REST call avoids the JS client's multipart encoding issues in Deno
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${KIOSK_ASSETS_BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: bytes,
      },
    );

    if (!uploadRes.ok) {
      const detail = await uploadRes.text().catch(() => "");
      console.error("upload-asset: storage upload failed", uploadRes.status, detail);
      return jsonResponse({ error: "Storage upload failed", detail }, 500);
    }

    const iconUrl = buildPublicUrl(path);

    if (purpose === "icon-catalog") {
      const supabase = createAdminClient();
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
  } catch (err) {
    console.error("upload-asset: unhandled error", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
