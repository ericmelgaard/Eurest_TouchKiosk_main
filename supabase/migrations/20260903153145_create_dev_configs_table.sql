/*
# Create dev_configs table for WAND Digital Asset dev-mode configuration

1. Purpose
   In development mode, the WAND Digital menu board app needs a way to persist
   configuration values (store key, partner API, brand, establishment, daypart,
   display, asset zone, etc.) that would normally come from the Content Forecaster
   or Digital Client iframe parent. This table stores those dev configurations
   so they survive page reloads and can be shared across sessions.

2. New Tables
   - `dev_configs`
     - `id` (uuid, primary key, auto-generated)
     - `config_key` (text, unique, not null) — a human-readable name identifying the config preset (e.g. "default", "dev-site-2174")
     - `store_key` (text) — WAND store key used for API calls
     - `partner_api` (text) — which integration to use (webtrition, ims, trm, qu, etc.)
     - `brand` (text) — SAP code / business unit
     - `establishment` (text) — venue / location ID
     - `store_id` (text) — TRM store ID
     - `display_id` (text) — TRM display ID
     - `display_name` (text) — human-readable display name
     - `daypart_id` (text) — TRM daypart ID
     - `daypart_name` (text) — human-readable daypart name
     - `asset_id` (text) — TRM asset ID
     - `asset_zone_id` (text) — TRM asset zone ID
     - `zone_id` (text) — TRM zone ID
     - `date_to_request` (text) — override date for menu requests (yyyy-mm-dd)
     - `is_active` (boolean, default false) — marks the currently selected config preset
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

3. Security
   - Enable RLS on `dev_configs`.
   - This is a single-tenant development tool with no sign-in screen.
   - Allow anon + authenticated full CRUD because the data is intentionally
     shared/public (development configuration, not user-private data).

4. Important Notes
   - The `config_key` column has a unique constraint so presets don't duplicate.
   - Only one preset should have `is_active = true` at a time; the app enforces
     this client-side by deactivating others before activating a new one.
*/

CREATE TABLE IF NOT EXISTS dev_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text UNIQUE NOT NULL,
    store_key text DEFAULT '',
    partner_api text DEFAULT '',
    brand text DEFAULT '',
    establishment text DEFAULT '',
    store_id text DEFAULT '',
    display_id text DEFAULT '',
    display_name text DEFAULT '',
    daypart_id text DEFAULT '',
    daypart_name text DEFAULT '',
    asset_id text DEFAULT '',
    asset_zone_id text DEFAULT '',
    zone_id text DEFAULT '',
    date_to_request text DEFAULT '',
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE dev_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dev_configs" ON dev_configs;
CREATE POLICY "anon_select_dev_configs" ON dev_configs FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dev_configs" ON dev_configs;
CREATE POLICY "anon_insert_dev_configs" ON dev_configs FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dev_configs" ON dev_configs;
CREATE POLICY "anon_update_dev_configs" ON dev_configs FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dev_configs" ON dev_configs;
CREATE POLICY "anon_delete_dev_configs" ON dev_configs FOR DELETE
    TO anon, authenticated USING (true);