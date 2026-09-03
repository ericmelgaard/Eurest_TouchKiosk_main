# Category Icons (Supabase)

This project no longer uses `TRM_menuItems` icon packs. Category card icons come from Supabase.

Icons are applied per-card in `js/menuLayout.js` (`MenuLayout.prototype.renderCategoryCards`), reading
directly from each row's `icon_url` returned by `category_cards` (see `configService.fetchCategoryCards`).

## Where Icons Come From

- `icon_catalog` table: "available" icons scoped by `concept_key`, inherited by every store under
  that concept. Populated via the config editor's icon picker (uploads go through the
  `upload-asset` edge function with `purpose=icon-catalog`).
- Custom per-store upload: a store can instead upload its own one-off icon
  (`upload-asset` with `purpose=custom-icon`), stored under `icons/custom/{storeKey}/...` in the
  `kiosk-assets` Storage bucket.

Either way, the resolved public URL is written directly onto the card's `category_cards.icon_url`
column (with `icon_source` recording whether it came from the catalog or a custom upload) - the
kiosk itself just renders whatever `icon_url` it's given, no environment/host resolution needed.

## Editing

Use the in-app config editor (visible only inside the WAND Content Forecaster preview, see
`js/configEditor.js`) to pick a catalog icon or upload a custom one per card.

See `supabase/migrations/0001_init_config_schema.sql` and `supabase/functions/upload-asset` for
the backing schema/upload logic.
