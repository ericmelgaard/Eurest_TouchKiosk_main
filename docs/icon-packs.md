# TRM Icon Packs

This project supports runtime icon packs from `TRM_menuItems`.

Icon packs are read and applied in `js/menuLayout.js` during app init.

## What You Can Configure

Create these `TRM_menuItems` entries:

- `catagory_icon_pak` (or `category_icon_pak`): asset folder ID for home/category card icons.

Value should be the numeric TRM asset folder ID only.

Example:

- `name: catagory_icon_pak`, `value: 129355`

## URL Pattern

The runtime URL is built as:

`https://{client-host}/cms_mediafiles/DIGITAL_ASSETS_NX01/{assetId}/{fileName}`

Example category icon URL:

`https://client-qa.wanddigital.com/cms_mediafiles/DIGITAL_ASSETS_NX01/129355/zLayer_10.png`

## Environment Host Mapping

Host is resolved by environment:

- QA -> `client-qa.wanddigital.com`
- Production -> `client.wanddigital.com`

Detection uses integration host first, then a hostname fallback.

## Category Icon Pack

Source setting: `catagory_icon_pak` / `category_icon_pak`

Applied to each home card with `data-overlay-layer`:

- Layer 10 -> `zLayer_10.png`
- Layer 20 -> `zLayer_20.png`
- Layer 30 -> `zLayer_30.png`
- etc.

Behavior:

1. Reads asset ID from TRM menu item.
2. Builds base URL for current environment.
3. Replaces each card icon image src with `zLayer_{layer}.png`.
4. If pack image fails, falls back to the original static icon from HTML.

## Key Normalization

TRM item names are normalized before matching:

- lowercase
- remove spaces, dashes, underscores, punctuation

So these forms are equivalent:

- `catagory_icon_pak`
- `catagory icon pak`
- `catagory-icon-pak`
- `catagoryiconpak`

## Notes

- If an icon pack setting is missing or empty, existing local/default icon behavior remains.
- Non-numeric characters are stripped from the asset ID before URL construction.
- This app currently uses category icon packs only.
