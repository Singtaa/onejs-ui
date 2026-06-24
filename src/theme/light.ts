import type { ThemeTokens } from "./tokens"

/** Default light theme. Same scales as dark; swap with `setTheme(lightTheme)`. */
export const lightTheme: ThemeTokens = {
  bg: "#f6f7f9",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  overlay: "#ffffff",
  overlayHover: "rgba(0, 0, 0, 0.05)",

  fg: "#1a1c1f",
  fgMuted: "#5a5e66",
  fgSubtle: "#8b8f98",

  border: "#e2e4e9",
  ring: "#1e293b",

  primary: "#3b82f6",
  primaryHover: "#2f6fe0",
  onPrimary: "#ffffff",

  danger: "#dc2626",
  onDanger: "#ffffff",
  success: "#16a34a",
  warning: "#d97706",
  info: "#3b82f6",

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
