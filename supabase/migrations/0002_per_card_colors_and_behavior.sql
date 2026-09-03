-- Per-card color overrides (label bar, icon border, hover/active) - optional, falls back
-- to the CSS :root defaults in style.css when a key is absent from the jsonb object.
alter table public.category_cards
    add column if not exists colors jsonb not null default '{}'::jsonb;

-- Behavior settings not tied to a color: inactivity timing/target, home-idle delay.
alter table public.site_config
    add column if not exists behavior jsonb not null default '{}'::jsonb;
