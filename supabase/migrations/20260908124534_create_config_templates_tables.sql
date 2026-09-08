/*
# Create config_templates and config_template_cards tables

1. Purpose
   Templates are reusable look-and-feel configurations saved at one of three
   scope levels: WAND (no company/concept key), Company (company key only), or
   Concept (company + concept key). Any site within the matching scope can
   import a template to apply its theme, branding images, behavior, and
   category card layout to the site's own config.

2. New Tables
   - `config_templates`
     - `id` (uuid, primary key, auto-generated)
     - `name` (text, not null) — human-readable template name
     - `description` (text) — optional longer description
     - `company_key` (integer, nullable) — null for WAND-level templates
     - `concept_key` (integer, nullable) — null for WAND and Company-level templates
     - `theme` (jsonb, not null default '{}') — same shape as site_config.theme
     - `background_image_url` (text, nullable) — same as site_config.background_image_url
     - `title_image_url` (text, nullable) — same as site_config.title_image_url
     - `behavior` (jsonb, not null default '{}') — same shape as site_config.behavior
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())
     - `updated_by` (text, nullable) — who last saved the template

   - `config_template_cards`
     - `id` (uuid, primary key, auto-generated)
     - `template_id` (uuid, not null, references config_templates on delete cascade)
     - `sort_order` (integer, not null default 0)
     - `name` (text, not null)
     - `active` (boolean, not null default true)
     - `icon_url` (text, nullable)
     - `icon_source` (text, not null default 'catalog', check in ('catalog','custom'))
     - `destination_type` (text, not null, check in ('trm_layer','static_page','iframe'))
     - `destination_value` (text, not null)
     - `colors` (jsonb, not null default '{}')
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

3. Security
   - Enable RLS on both tables.
   - Public read-only SELECT (same pattern as site_config / category_cards).
   - No anon INSERT/UPDATE/DELETE — all writes go through edge functions
     using the service role key.

4. Important Notes
   - The scope is inferred from the keys: both null = WAND, company_key set
     and concept_key null = Company, both set = Concept.
   - config_template_cards cascades on delete so removing a template cleans
     up its card layout automatically.
   - Idempotent: uses IF NOT EXISTS for tables, indexes, and DROP IF EXISTS
     for policies.
*/

CREATE TABLE IF NOT EXISTS public.config_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    company_key integer,
    concept_key integer,
    theme jsonb NOT NULL DEFAULT '{}'::jsonb,
    background_image_url text,
    title_image_url text,
    behavior jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by text
);

CREATE INDEX IF NOT EXISTS config_templates_company_key_idx
    ON public.config_templates (company_key);

CREATE INDEX IF NOT EXISTS config_templates_concept_key_idx
    ON public.config_templates (concept_key);

CREATE TABLE IF NOT EXISTS public.config_template_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.config_templates (id) ON DELETE CASCADE,
    sort_order integer NOT NULL DEFAULT 0,
    name text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    icon_url text,
    icon_source text NOT NULL DEFAULT 'catalog' CHECK (icon_source IN ('catalog', 'custom')),
    destination_type text NOT NULL CHECK (destination_type IN ('trm_layer', 'static_page', 'iframe')),
    destination_value text NOT NULL,
    colors jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS config_template_cards_template_id_idx
    ON public.config_template_cards (template_id, sort_order);

ALTER TABLE public.config_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_template_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_templates_public_read" ON public.config_templates;
CREATE POLICY "config_templates_public_read" ON public.config_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "config_template_cards_public_read" ON public.config_template_cards;
CREATE POLICY "config_template_cards_public_read" ON public.config_template_cards
    FOR SELECT USING (true);
