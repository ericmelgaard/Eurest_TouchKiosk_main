# TRM Theme System

This project supports runtime theming from `TRM_menuItems`.

Recommended setup: separate `TRM_menuItems` rows (one row per theme key/value).

Theme values are applied in `menuLayout.js` through:

- `MenuLayout.prototype.applyThemeFromTRMMenuItems(TRMMenuItems)`

CSS default values live in `style.css` under `:root`.

## How It Works

1. App loads `TRM_menuItems` (fields like `id`, `name`, `value`).
2. Theme parser reads each row using this key priority:
   - `name`
   - `key`
   - `id`
3. The key is normalized:
   - lowercased
   - spaces, dashes, underscores, and punctuation removed
4. If key matches a supported theme name, and `value` is a valid CSS color, JS sets the matching CSS variable.
5. If key is missing or value is invalid, the CSS default in `:root` stays active.

## TRM Menu Items To Create (Canonical Names)

Use these names in `TRM_menuItems.name`.

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

`value` must be a valid CSS color string, for example:

- `#242d37`
- `#fff`
- `rgb(36, 45, 55)`
- `rgba(0, 0, 0, 0.85)`
- `white`

If invalid, that row is ignored.

## Two Ways To Send Theme Data

Preferred: Option A (separate rows / separate IDs).

### Option A: One menu item per color

Example rows:

- `name: headerBackground`, `value: #1f2a36`
- `name: cardIconOutlineColor`, `value: #00a651`
- `name: inactivityText`, `value: rgba(255,255,255,0.92)`

### Option B: One JSON bundle row

Use one of these names:

- `themeColors`
- `theme`
- `appColors`

Recommended name when using JSON: `themeColors`

Put JSON in `value`:

```json
{
  "headerBackground": "#1f2a36",
  "cardIconOutlineColor": "#00a651",
  "inactivityBackground": "#253240"
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

## Defaults And Ownership

- CSS defaults are the source of truth in `style.css` `:root`.
- JS only applies overrides from TRM data.
- No TRM value = default CSS value remains in effect.
