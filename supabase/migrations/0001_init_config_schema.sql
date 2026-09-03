-- app_shell_CDL configuration schema
-- Site is the final level of inheritance: the kiosk always reads its own store_key row only.
-- Sharing between company/concept-scoped sites happens via an explicit "copy template" action
-- (see supabase/functions/copy-template), not a live override cascade.

create extension if not exists "pgcrypto";

-- One row per store (site_config.store_key matches AssetConfiguration.SKey in app_shell_CDL).
create table if not exists public.site_config (
    store_key text primary key,
    company_key integer,
    concept_key integer,
    company_name text,
    concept_name text,
    store_name text,
    theme jsonb not null default '{}'::jsonb,
    background_image_url text,
    title_image_url text,
    updated_at timestamptz not null default now(),
    updated_by text
);

-- Home page category cards, ordered per store. Fully dynamic (add/remove/reorder).
create table if not exists public.category_cards (
    id uuid primary key default gen_random_uuid(),
    store_key text not null references public.site_config (store_key) on delete cascade,
    sort_order integer not null default 0,
    name text not null,
    active boolean not null default true,
    icon_url text,
    icon_source text not null default 'catalog' check (icon_source in ('catalog', 'custom')),
    destination_type text not null check (destination_type in ('trm_layer', 'static_page', 'iframe')),
    destination_value text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists category_cards_store_key_idx on public.category_cards (store_key, sort_order);

-- Concept-scoped "available icons" catalog; inherited by every store under that concept.
create table if not exists public.icon_catalog (
    id uuid primary key default gen_random_uuid(),
    concept_key integer not null,
    label text not null,
    icon_url text not null,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists icon_catalog_concept_key_idx on public.icon_catalog (concept_key, sort_order);

-- RLS: public read-only. All writes happen server-side in edge functions using the service role key.
alter table public.site_config enable row level security;
alter table public.category_cards enable row level security;
alter table public.icon_catalog enable row level security;

drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read" on public.site_config for select using (true);

drop policy if exists "category_cards_public_read" on public.category_cards;
create policy "category_cards_public_read" on public.category_cards for select using (true);

drop policy if exists "icon_catalog_public_read" on public.icon_catalog;
create policy "icon_catalog_public_read" on public.icon_catalog for select using (true);

-- Storage: one public-read bucket for icons/branding assets. No public write policy;
-- uploads only happen via the upload-asset edge function (service role).
insert into storage.buckets (id, name, public)
values ('kiosk-assets', 'kiosk-assets', true)
on conflict (id) do nothing;

drop policy if exists "kiosk_assets_public_read" on storage.objects;
create policy "kiosk_assets_public_read" on storage.objects for select using (bucket_id = 'kiosk-assets');
