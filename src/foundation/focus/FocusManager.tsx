import { useLayoutEffect, type ReactNode } from "react"
import { initFocusVisible, disposeFocusVisible } from "./focusVisible"

export interface FocusManagerProps {
  children?: ReactNode
}

/**
 * Mounts the global focus-visible manager. Optional convenience: `ThemeProvider`
 * already initializes it, so apps wrapped in a theme need nothing extra. Use this
 * when theming manually.
 */
export function FocusManager({ children }: FocusManagerProps) {
  useLayoutEffect(() => {
    initFocusVisible()
    return disposeFocusVisible
  }, [])
  return <>{children}</>
}
