import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react"
import { applyTheme } from "./applyTheme"
import { darkTheme } from "./dark"
import type { ThemeTokens } from "./tokens"
import { initFocusVisible, disposeFocusVisible } from "../foundation/focus/focusVisible"

interface ThemeContextValue {
  /** The currently active token set (read for inline/dynamic values that can't use USS var()). */
  tokens: ThemeTokens
  /** Swap the active theme. Instant: recompiles the variables sheet, no re-render of the tree. */
  setTheme: (tokens: ThemeTokens) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  tokens: darkTheme,
  setTheme: () => {},
})

export interface ThemeProviderProps {
  /** Initial theme. Defaults to `darkTheme`. */
  theme?: ThemeTokens
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
  const [tokens, setTokens] = useState<ThemeTokens>(theme)

  useLayoutEffect(() => {
    applyTheme(tokens)
  }, [tokens])

  // Focus-visible ring manager: one-shot (not keyed on tokens, so a theme swap
  // doesn't tear it down). Lives for the panel's lifetime.
  useLayoutEffect(() => {
    initFocusVisible()
    return () => disposeFocusVisible()
  }, [])

  const setTheme = useCallback((next: ThemeTokens) => setTokens(next), [])

  return (
    <ThemeContext.Provider value={{ tokens, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
