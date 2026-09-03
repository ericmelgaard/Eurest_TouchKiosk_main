import { createClient } from "npm:@supabase/supabase-js@2";

// Service-role client for server-side use only. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// are auto-injected by the Supabase Edge Function runtime - never pass the service key to a client.
export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const KIOSK_ASSETS_BUCKET = "kiosk-assets";

export function buildPublicUrl(path: string): string {
  const url = Deno.env.get("SUPABASE_URL");
  return `${url}/storage/v1/object/public/${KIOSK_ASSETS_BUCKET}/${path}`;
}

