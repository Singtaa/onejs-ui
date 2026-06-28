import type { ThemeTokens } from "./tokens"
import { darkTheme } from "./dark"
import { lightTheme } from "./light"

/**
 * Theme registry: lets themes be referenced by name (`setTheme("pixel")`,
 * `<ThemeProvider theme="pixel">`) instead of threading token objects around.
 *
 * A premade theme registers itself at module scope, so importing it once (e.g. at
 * app entry) makes it available by name everywhere. The built-in `dark` / `light`
 * themes are registered here.
 */
const registry = new Map<string, ThemeTokens>()
const RESERVED = new Set(["dark", "light"])

/** Register a theme under a name (idempotent; last registration wins). Warns when a
 *  built-in (`dark`/`light`) is clobbered, since names share one global namespace. */
export function registerTheme(name: string, tokens: ThemeTokens): void {
  if (RESERVED.has(name)) {
    console.warn(`[onejs-ui] registerTheme: overriding the built-in "${name}" theme`)
  }
  registry.set(name, tokens)
}

/** Look up a registered theme by name, or `undefined` if not registered. */
export function getTheme(name: string): ThemeTokens | undefined {
  return registry.get(name)
}

/** Names of all registered themes (useful for a theme picker). */
export function getRegisteredThemes(): string[] {
  return Array.from(registry.keys())
}

/** Resolve a theme name to its tokens, or pass a tokens object through unchanged. */
export function resolveTheme(theme: ThemeTokens | string): ThemeTokens {
  if (typeof theme !== "string") return theme
  const tokens = registry.get(theme)
  if (!tokens) {
    throw new Error(
      `onejs-ui: theme "${theme}" is not registered. Import the theme module ` +
      `(which registers it) before using it by name, or pass a ThemeTokens object.`,
    )
  }
  return tokens
}

// Built-ins go straight into the map (not via registerTheme) so they don't trip the
// reserved-name warning on initial load / hot reload.
registry.set("dark", darkTheme)
registry.set("light", lightTheme)
