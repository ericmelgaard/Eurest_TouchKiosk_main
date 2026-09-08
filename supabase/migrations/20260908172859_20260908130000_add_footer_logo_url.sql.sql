/*
# Add footer_logo_url to site_config and config_templates

1. Purpose
   The home screen has a footer logo (the "eurest-logo" image at the bottom).
   This makes it editable and storable per-location, just like the title and
   background images — and included in templates so it carries over on import.

2. Changes
   - `site_config`: add `footer_logo_url` (text, nullable) — URL of the footer
     logo image. Falls back to the static default in index.html when null.
   - `config_templates`: add `footer_logo_url` (text, nullable) — same field,
     saved/restored alongside the other branding images when a template is
     created or imported.

3. Security
   - No RLS changes needed; existing public-read policies cover the new column.

4. Notes
   - Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ guards.
   - Non-destructive: adds nullable columns only, no data loss.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_config' AND column_name = 'footer_logo_url'
  ) THEN
    ALTER TABLE public.site_config ADD COLUMN footer_logo_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'config_templates' AND column_name = 'footer_logo_url'
  ) THEN
    ALTER TABLE public.config_templates ADD COLUMN footer_logo_url text;
  END IF;
END $$;
