import type { ThemeTokens } from "./tokens"

const ROOT_CLASS = "ojs-root"
const SHEET_NAME = "ojs-theme"

/** `surfaceRaised` -> `surface-raised`, `radiusSm` -> `radius-sm`, `space1` -> `space-1`. */
function camelToKebab(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase()
}

/**
 * Emit a theme as USS custom properties and apply it to the panel.
 *
 * Generates a single `.ojs-root { --ojs-*: value; }` sheet, compiles it via the
 * runtime USS compiler (dedup-by-name replaces any prior theme), and tags the
 * render root with `ojs-root` so every descendant inherits the variables.
 *
 * Because Unity resolves `var()` against the cascade at apply time, swapping
 * themes is a single crossing with no React re-render and no per-element style
 * re-marshal. Call once at startup, then again whenever the theme changes.
 *
 * @param tokens The theme to apply.
 * @param target Optional element to carry the `ojs-root` class. Defaults to the
 *   global render root (`__root`).
 */
export function applyTheme(tokens: ThemeTokens, target?: any): void {
  const decls = Object.entries(tokens)
    .map(([key, value]) => `    --ojs-${camelToKebab(key)}: ${value};`)
    .join("\n")

  // Map Unity's native control text vars to our foreground. The default runtime
  // theme (UnityDefaultRuntimeTheme.tss) sets these to dark-mode light values, and
  // native sub-elements (TextField text, native control labels) read them - which
  // would otherwise win over our `color` and stay light in a light theme. Use the
  // literal value, not var(--ojs-fg): the runtime USS compiler doesn't reliably
  // resolve a var-in-var chain.
  const nativeOverrides = [
    `--unity-colors-default-text: ${tokens.fg};`,
    `--unity-colors-label-text: ${tokens.fg};`,
    `--unity-colors-input_field-text: ${tokens.fg};`,
  ]
    .map((d) => `    ${d}`)
    .join("\n")

  const uss = `.${ROOT_CLASS} {\n${decls}\n${nativeOverrides}\n}`
  compileStyleSheet(uss, SHEET_NAME)

  const root = target ?? (typeof __root !== "undefined" ? __root : undefined)
  try {
    root?.AddToClassList?.(ROOT_CLASS)
  } catch {
    // Root not ready yet (e.g. called before render); the class is idempotent,
    // so a later applyTheme() call will tag it.
  }
}
