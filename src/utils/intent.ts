/**
 * The status vocabulary Badge and Toast share. `neutral` is the plain surface;
 * the rest take the theme color of the same name (`primary`, `success`,
 * `warning`, `danger`, `info`).
 */
export type StatusIntent = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

/** @deprecated Use `StatusIntent`. Toast's `tone` names it; `"default"` is `"neutral"`. */
export type ToastTone = "default" | "success" | "warning" | "danger" | "info"

/** What a MenuItem can mean: an ordinary action or a destructive one. */
export type MenuItemIntent = "neutral" | "danger"

/** A toast's intent, falling back to the deprecated `tone`, then to neutral. */
export function toastIntent(intent: StatusIntent | undefined, tone: ToastTone | undefined): StatusIntent {
  if (intent) return intent
  if (!tone || tone === "default") return "neutral"
  return tone
}

/** A menu item's intent, falling back to the deprecated `danger` flag, then to neutral. */
export function menuItemIntent(intent: MenuItemIntent | undefined, danger: boolean | undefined): MenuItemIntent {
  return intent ?? (danger ? "danger" : "neutral")
}
