import { useRef } from "react"
import type { KeyEventData } from "onejs-react"

/**
 * Handlers for the view wrapping an overlay's trigger, so the trigger opens it
 * however it is activated: a press arrives as a click, Enter and gamepad South
 * as a NavigationSubmit, and Space or Enter as a key down, each bubbling from
 * the focused trigger. One Enter can produce both a submit and a key down, so
 * activations within a frame count once.
 */
export function useTriggerActivation(toggle: () => void) {
  const activating = useRef(false)
  const activate = () => {
    if (activating.current) return
    activating.current = true
    requestAnimationFrame(() => {
      activating.current = false
    })
    toggle()
  }
  return {
    onClick: activate,
    onNavigationSubmit: activate,
    onKeyDown: (e: KeyEventData) => {
      if (e.key === "Space" || e.key === "Return" || e.key === "KeypadEnter") activate()
    },
  }
}
