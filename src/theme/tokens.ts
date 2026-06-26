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

  // Typography font (optional): applied on the render root, inherited by every
  // descendant (UITK `-unity-font-definition` is an inherited property). A USS
  // value - `resource("...")` (build-safe) or `url("...")` (editor-only). Omit it
  // and the panel's default font is used.
  /** `--ojs-font` */
  font?: string

  // Decoration (optional): lets a theme dress Card/Button in a 9-slice frame.
  // Each maps to a `--ojs-*` slot the components consume; omit them and the
  // components render with their flat token styling. Image fields hold a full USS
  // value (`url("...")` or `resource("...")`); slice fields hold a unitless pixel
  // inset; sliceScale holds a length (default `1px`).
  /** `--ojs-card-image` */
  cardImage?: string
  /** `--ojs-card-slice` (pixel inset, all four sides) */
  cardSlice?: string
  /** `--ojs-card-slice-scale` */
  cardSliceScale?: string
  /** `--ojs-button-image` (filled intents only; secondary/ghost clear it) */
  buttonImage?: string
  /** `--ojs-button-image-hover` (filled-button frame on hover) */
  buttonImageHover?: string
  /** `--ojs-button-image-active` (filled-button frame while pressed) */
  buttonImageActive?: string
  /** `--ojs-button-slice` (pixel inset, all four sides) */
  buttonSlice?: string
  /** `--ojs-button-slice-scale` */
  buttonSliceScale?: string
  /** `--ojs-input-image` (9-slice frame for the text field) */
  inputImage?: string
  /** `--ojs-input-slice` (pixel inset, all four sides) */
  inputSlice?: string
  /** `--ojs-input-slice-scale` */
  inputSliceScale?: string

  // Control skins (optional): native form controls expose an image plus shape
  // overrides (radius / border-width) so a theme can sprite-skin them. Defaults
  // preserve the flat, rounded look, so other themes are unaffected.
  /** `--ojs-checkbox-image` (unchecked box) */
  checkboxImage?: string
  /** `--ojs-checkbox-image-checked` (checked box, with the check baked in) */
  checkboxImageChecked?: string
  /** `--ojs-checkbox-border-width` (default `1px`; set `0` when the sprite has its own frame) */
  checkboxBorderWidth?: string
  /** `--ojs-radio-image` (unselected ring) */
  radioImage?: string
  /** `--ojs-radio-image-checked` (selected ring, dot baked in) */
  radioImageChecked?: string
  /** `--ojs-radio-radius` (default `9px`; set `0` to square the ring) */
  radioRadius?: string
  /** `--ojs-radio-border-width` (default `1px`) */
  radioBorderWidth?: string
  /** `--ojs-radio-dot-color` (default `var(--ojs-primary)`; set transparent when the dot is baked into the sprite) */
  radioDotColor?: string
  /** `--ojs-switch-track-image` (off) */
  switchTrackImage?: string
  /** `--ojs-switch-track-image-checked` (on) */
  switchTrackImageChecked?: string
  /** `--ojs-switch-knob-image` */
  switchKnobImage?: string
  /** `--ojs-switch-radius` (default `11px`; set `0` to square the track) */
  switchRadius?: string
  /** `--ojs-switch-knob-radius` (default `7px`; set `0` to square the knob) */
  switchKnobRadius?: string
  /** `--ojs-slider-rail-image` */
  sliderRailImage?: string
  /** `--ojs-slider-thumb-image` */
  sliderThumbImage?: string
  /** `--ojs-slider-radius` (default `3px`; rail) */
  sliderRadius?: string
  /** `--ojs-slider-thumb-radius` (default `8px`) */
  sliderThumbRadius?: string
  /** `--ojs-slider-rail-slice` (9-slice inset for the rail, which stretches to width; default `0`) */
  sliderRailSlice?: string

  // Overlay surfaces (optional): a 9-slice frame shared by Dialog, Popover,
  // DropdownMenu, Drawer, Toast, and Tooltip. No-op by default.
  /** `--ojs-surface-image` (9-slice frame for floating/overlay surfaces) */
  surfaceImage?: string
  /** `--ojs-surface-slice` (pixel inset, all four sides) */
  surfaceSlice?: string
  /** `--ojs-surface-slice-scale` */
  surfaceSliceScale?: string
}
