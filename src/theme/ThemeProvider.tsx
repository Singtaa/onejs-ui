import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { applyTheme, removeTheme } from "./applyTheme"
import { darkTheme } from "./dark"
import { resolveTheme } from "./registry"
import type { ThemeTokens } from "./tokens"
import { initFocusVisible, disposeFocusVisible } from "../foundation/focus/focusVisible"

interface ThemeContextValue {
  /** The currently active token set (read for inline/dynamic values that can't use USS var()). */
  tokens: ThemeTokens
  /** The registered name of the active theme, when it was chosen by name ("dark", "pixel"); undefined for a tokens object. */
  name?: string
  /** Swap the active theme by tokens object or registered name. Instant: recompiles the variables sheet; only `useTheme()` consumers re-render, not the var()-styled tree. */
  setTheme: (theme: ThemeTokens | string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  tokens: darkTheme,
  setTheme: () => {},
})

export interface ThemeProviderProps {
  /** The theme: a `ThemeTokens` object or a registered theme name. Defaults to
   *  `darkTheme`. Changing it switches the theme, as `setTheme()` from `useTheme()`
   *  does; pass a stable object (a constant or a memoised value), since a new object
   *  on every render re-applies the theme each time. */
  theme?: ThemeTokens | string
  children?: ReactNode
}

/**
 * Applies a theme to the panel and exposes it via `useTheme()`.
 *
 * The visual theming happens through USS variables (see `applyTheme`), so the
 * provider does not need to re-render the tree to restyle it. The context only
 * carries the live token values (for the inline/dynamic long tail) and the
 * `setTheme` swapper.
 */
export function ThemeProvider({ theme = darkTheme, children }: ThemeProviderProps) {
  const [active, setActive] = useState(() => describe(theme))
  const tokens = active.tokens

  // Follow the prop after mount, so <ThemeProvider theme={dark ? "dark" : "light"}>
  // switches. The first run is the mount itself, already in state.
  const mounted = useRef(false)
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setActive(describe(theme))
  }, [theme])

  useLayoutEffect(() => {
    applyTheme(tokens)
  }, [tokens])

  // Drop the theme sheet + root class on UNMOUNT only (separate [] effect, so a
  // theme swap above doesn't briefly remove the sheet).
  useLayoutEffect(() => () => removeTheme(), [])

  // Focus-visible ring manager: one-shot (not keyed on tokens, so a theme swap
  // doesn't tear it down). Lives for the panel's lifetime.
  useLayoutEffect(() => {
    initFocusVisible()
    return () => disposeFocusVisible()
  }, [])

  const setTheme = useCallback((next: ThemeTokens | string) => setActive(describe(next)), [])

  // Memoized so consumers only re-render when the theme actually changes, not on every
  // unrelated re-render of ThemeProvider's parent.
  const value = useMemo(() => ({ tokens, name: active.name, setTheme }), [tokens, active.name, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function describe(theme: ThemeTokens | string): { tokens: ThemeTokens; name?: string } {
  return { tokens: resolveTheme(theme), name: typeof theme === "string" ? theme : undefined }
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
