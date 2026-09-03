# Theme & Branding System (Supabase)

This project supports runtime theming and branding from Supabase, scoped to the kiosk's own
`store_key` (see `js/supabaseConfig.js`, `js/configService.js`).

Theme colors live in `site_config.theme` (a single JSONB object, one key per canonical theme
name below). Background and title/logo images live in `site_config.background_image_url` /
`site_config.title_image_url`.

Theme and branding are applied in `menuLayout.js` through:

- `MenuLayout.prototype.applyThemeFromSiteConfig(siteConfig)`
- `MenuLayout.prototype.applyBrandingFromSiteConfig(siteConfig)`

CSS default values live in `style.css` under `:root`.

## How It Works

1. App fetches `site_config` for its own `store_key` from Supabase (`configService.fetchSiteConfig`).
2. Theme parser reads each key of `site_config.theme`.
3. The key is normalized:
   - lowercased
   - spaces, dashes, underscores, and punctuation removed
4. If key matches a supported theme name, and its value is a valid CSS color, JS sets the matching CSS variable.
5. If a key is missing or its value is invalid, the CSS default in `:root` stays active.
6. `background_image_url` / `title_image_url` (if set) replace the home page background image and
   the `.welcome-header` logo; if absent, the static defaults already in `index.html`/`style.css` remain.

## TRM Menu Items To Create (Canonical Names)

Use these names as keys in `site_config.theme`.

| TRM name | CSS variable | Applies to |
|---|---|---|
| `headerBackground` | `--welcome-header-bg` | Welcome header background (`.welcome-header`) |
| `headerText` | `--header-text-color` | Main header text (`.header`) |
| `subHeaderText` | `--sub-header-text-color` | Sub-header text (`.sub-header`) |
| `cardBackground` | `--feature-card-bg` | Feature card base bg (`.feature-card`) |
| `cardHoverBackground` | `--feature-card-hover-bg` | Feature card hover bg (`.feature-card:hover`) |
| `cardActiveBackground` | `--feature-card-active-bg` | Feature card active bg (`.feature-card:active`) |
| `cardLabelBackground` | `--card-label-bg` | Card label bg (`.card-label`) |
| `cardIconOutlineColor` | `--card-icon-outline-color` | Card icon outline (`.card-icon img`) |
| `inactivityOverlayBg` | `--inactivity-overlay-bg` | Inactivity full-screen overlay (`.inactivity-modal-overlay`) |
| `inactivityBackground` | `--inactivity-modal-bg` | Inactivity modal panel (`.inactivity-modal-container`) |
| `inactivityHeading` | `--inactivity-modal-heading-color` | Inactivity heading text (`.inactivity-modal-heading`) |
| `inactivityText` | `--inactivity-modal-text-color` | Inactivity message text (`.inactivity-modal-message`) |
| `inactivityPrimaryButtonBg` | `--inactivity-primary-btn-bg` | Inactivity primary button bg |
| `inactivityPrimaryButtonHoverBg` | `--inactivity-primary-btn-hover-bg` | Inactivity primary button hover bg |

## Supported Aliases

These also work and map to the same target variables:

- `welcomeHeaderBg` -> `--welcome-header-bg`
- `cardBg` -> `--feature-card-bg`
- `cardLabelBg` -> `--card-label-bg`
- `cardIconBorder` -> `--card-icon-outline-color`
- `inactivityModalBg` -> `--inactivity-modal-bg`

## Value Rules

Each value must be a valid CSS color string, for example:

- `#242d37`
- `#fff`
- `rgb(36, 45, 55)`
- `rgba(0, 0, 0, 0.85)`
- `white`

If invalid, that key is ignored.

## Theme Storage

`site_config.theme` is a single JSONB object, one key per canonical name (or alias, or a direct
CSS variable name like `--welcome-header-bg`):

```json
{
  "headerBackground": "#1f2a36",
  "cardIconOutlineColor": "#00a651",
  "inactivityText": "rgba(255,255,255,0.92)"
}
```

Full default starter JSON:

```json
{
   "headerBackground": "#242d37",
   "headerText": "#2c2c2c",
   "subHeaderText": "#555",
   "cardBackground": "transparent",
   "cardHoverBackground": "#8B9AA4",
   "cardActiveBackground": "#6B7A84",
   "cardLabelBackground": "#7a746e",
   "cardIconOutlineColor": "#242d37",
   "inactivityOverlayBg": "rgba(0, 0, 0, 0.85)",
   "inactivityBackground": "#242d37",
   "inactivityHeading": "#ffffff",
   "inactivityText": "rgba(255, 255, 255, 0.85)",
   "inactivityPrimaryButtonBg": "#5B9BD5",
   "inactivityPrimaryButtonHoverBg": "#4a8bc4"
}
```

JSON keys can be canonical names above, aliases, or direct CSS variable names (for example `--welcome-header-bg`).

## Recommended Content Entry Pattern

1. Start with canonical names only.
2. Add one or two keys at first and verify on-screen.
3. Expand to full palette.
4. Keep values as hex or rgba for consistency.
5. Save through the in-app config editor (`js/configEditor.js`), which POSTs to the
   `save-site-config` edge function - never write `site_config` directly from the client.

## Defaults And Ownership

- CSS defaults are the source of truth in `style.css` `:root`.
- JS only applies overrides from `site_config.theme`.
- No value for a given key = default CSS value remains in effect.
- Writes are validated server-side in `supabase/functions/save-site-config` (CSS color shape,
  http(s)-only image URLs) before being upserted with the service-role key.
