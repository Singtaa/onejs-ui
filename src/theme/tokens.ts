/**
 * Semantic design tokens for onejs-ui.
 *
 * Every field maps to a `--ojs-<kebab-case>` USS custom property emitted by
 * `applyTheme()`. Components reference these via `var(--ojs-*)` in their
 * `.module.uss` files (never inline `style=`, which cannot read USS variables).
 *
 * Values are plain USS-ready strings: colors (`#rrggbb` / `rgba(...)`),
 * lengths (`8px`), durations (`160ms`), easing keywords (`ease-in-out`).
 *
 * Swapping the whole set (light/dark/custom) is one `applyTheme()` call that
 * recompiles a single `:root`-equivalent variables sheet; Unity re-resolves the
 * cascade natively with no React re-render and no per-element style re-marshal.
 */
export interface ThemeTokens {
  // Surfaces (background layers, low to high elevation)
  bg: string
  surface: string
  surfaceRaised: string
  overlay: string
  /** Translucent fill for subtle hover/press on bordered/ghost controls. */
  overlayHover: string

  // Foreground (text) tones
  fg: string
  fgMuted: string
  fgSubtle: string

  // Lines & focus
  border: string
  ring: string

  // Accent / primary action
  primary: string
  primaryHover: string
  onPrimary: string

  // Status
  danger: string
  onDanger: string
  success: string
  warning: string
  info: string

  // Radii
  radiusSm: string
  radiusMd: string
  radiusLg: string
  radiusFull: string

  // Spacing scale
  space1: string
  space2: string
  space3: string
  space4: string
  space5: string
  space6: string

  // Type scale
  fontSizeSm: string
  fontSizeMd: string
  fontSizeLg: string
  fontSizeXl: string

  // Motion
  motionFast: string
  motionBase: string
  motionSlow: string
  ease: string
}
