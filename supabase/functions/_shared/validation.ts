// Shared input validation for the config-tool edge functions.
// Every function must run untrusted client payloads through these before touching the database.

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeStoreKey(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const str = String(value).trim();
  return str.length ? str : null;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

const CSS_COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-zA-Z]+)$/;

export function isPlausibleCssColor(value: unknown): value is string {
  return typeof value === "string" && CSS_COLOR_PATTERN.test(value.trim()) && value.trim().length <= 64;
}

// Only allow http(s) URLs, or same-origin-relative paths under our own storage bucket.
export function isPlausibleAssetUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_err) {
    return false;
  }
}

export const DESTINATION_TYPES = ["trm_layer", "static_page", "iframe"] as const;
export type DestinationType = typeof DESTINATION_TYPES[number];

export function isDestinationType(value: unknown): value is DestinationType {
  return typeof value === "string" && (DESTINATION_TYPES as readonly string[]).includes(value);
}

export const ICON_SOURCES = ["catalog", "custom"] as const;
export type IconSource = typeof ICON_SOURCES[number];

export function isIconSource(value: unknown): value is IconSource {
  return typeof value === "string" && (ICON_SOURCES as readonly string[]).includes(value);
}

// "transparent" is a valid CSS keyword and already matches isPlausibleCssColor's [a-zA-Z]+ branch.
export const CARD_COLOR_KEYS = [
  "cardBackground",
  "cardHoverBackground",
  "cardActiveBackground",
  "labelColor",
  "iconBorderColor",
] as const;

export const INACTIVITY_TARGETS = ["home", "idle"] as const;
export type InactivityTarget = typeof INACTIVITY_TARGETS[number];

export function isInactivityTarget(value: unknown): value is InactivityTarget {
  return typeof value === "string" && (INACTIVITY_TARGETS as readonly string[]).includes(value);
}

export function isMsInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

