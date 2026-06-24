import { useLayoutEffect, useRef } from "react"
import { getFocusedElement, focusElement } from "./focusUtils"
import type { VisualElement } from "onejs-react"

/**
 * Capture the focused element when this runs and restore it on cleanup.
 *
 * Uses a layout effect so the capture happens before any child autofocus moves
 * focus. Intended for overlays: dismissing returns focus to whatever was focused
 * when the overlay opened (typically the trigger).
 *
 * `FocusScope` already does this when `restoreFocus` is set; use this hook
 * directly only for overlays that don't wrap their content in a `FocusScope`.
 */
export function useFocusReturn(enabled = true): void {
  const savedRef = useRef<VisualElement | null>(null)

  useLayoutEffect(() => {
    if (!enabled) return
    savedRef.current = getFocusedElement()
    return () => {
      focusElement(savedRef.current)
      savedRef.current = null
    }
  }, [enabled])
}
