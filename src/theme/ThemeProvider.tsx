import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
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
  /** Swap the active theme by tokens object or registered name. Instant: recompiles the variables sheet; only `useTheme()` consumers re-render, not the var()-styled tree. */
  setTheme: (theme: ThemeTokens | string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  tokens: darkTheme,
  setTheme: () => {},
})

export interface ThemeProviderProps {
  /** Initial theme - a `ThemeTokens` object or a registered theme name. Defaults to
   *  `darkTheme`. Read ONCE at mount; change the theme at runtime with `setTheme()` from
   *  `useTheme()`, not by changing this prop (later prop changes are ignored). */
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
  const [tokens, setTokens] = useState<ThemeTokens>(() => resolveTheme(theme))

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

  const setTheme = useCallback((next: ThemeTokens | string) => setTokens(resolveTheme(next)), [])

  // Memoized so consumers only re-render when `tokens` actually changes, not on every
  // unrelated re-render of ThemeProvider's parent.
  const value = useMemo(() => ({ tokens, setTheme }), [tokens, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
