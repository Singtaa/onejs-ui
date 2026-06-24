import type { ThemeTokens } from "./tokens"

/** Default dark theme. Flat, minimal, surface-contrast based (USS has no box-shadow). */
export const darkTheme: ThemeTokens = {
  bg: "#0e0f13",
  surface: "#16181d",
  surfaceRaised: "#1d2027",
  overlay: "#23262e",
  overlayHover: "rgba(255, 255, 255, 0.07)",

  fg: "#e6e7ea",
  fgMuted: "#a0a3ab",
  fgSubtle: "#6b6f78",

  border: "#2a2d35",
  ring: "#cdddff",

  primary: "#4c8bf5",
  primaryHover: "#3d78db",
  onPrimary: "#ffffff",

  danger: "#e5484d",
  onDanger: "#ffffff",
  success: "#46a758",
  warning: "#f5a623",
  info: "#4c8bf5",

  radiusSm: "4px",
  radiusMd: "8px",
  radiusLg: "12px",
  radiusFull: "9999px",

  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",
  space5: "20px",
  space6: "24px",

  fontSizeSm: "12px",
  fontSizeMd: "14px",
  fontSizeLg: "18px",
  fontSizeXl: "24px",

  motionFast: "120ms",
  motionBase: "180ms",
  motionSlow: "260ms",
  ease: "ease-in-out",
}
