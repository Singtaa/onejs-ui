import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react"
import { View } from "onejs-react"
import { getFocusedElement, focusElement, focusFirstIn, isWithin } from "./focusUtils"

export interface FocusScopeProps {
  /** Focus the first focusable descendant on mount. Default true. */
  autoFocus?: boolean
  /** Restore focus to the previously focused element on unmount. Default true. */
  restoreFocus?: boolean
  /**
   * Keep focus inside the scope. When focus leaves (keyboard or gamepad, in any
   * direction), it is pulled back to the first focusable inside. Default true.
   */
  trap?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Manages focus for an overlay/region: autofocus on open, focus restoration on
 * close, and an optional focus trap.
 *
 * The trap listens for `focusout` bubbling up from descendants; if focus landed
 * outside the scope, it returns focus inside on the next frame. This works for
 * both Tab/Next/Previous and spatial arrow/D-pad navigation. Used by Dialog and
 * Drawer.
 */
export function FocusScope({
  autoFocus = true,
  restoreFocus = true,
  trap = true,
  className,
  children,
}: FocusScopeProps) {
  const rootRef = useRef<any>(null)
  const mountedRef = useRef(true)

  useLayoutEffect(() => {
    mountedRef.current = true
    // Capture before autofocus so restore returns to the pre-open element.
    const saved = restoreFocus ? getFocusedElement() : null
    if (autoFocus && rootRef.current) {
      focusFirstIn(rootRef.current)
    }
    return () => {
      mountedRef.current = false
      if (restoreFocus) focusElement(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onFocusOut = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    // Defer so the focus controller has settled on the new focused element.
    requestAnimationFrame(() => {
      if (!mountedRef.current) return
      const focused = getFocusedElement()
      if (focused && !isWithin(root, focused)) {
        focusFirstIn(root)
      }
    })
  }, [])

  return (
    <View ref={rootRef} className={className} onFocusOut={trap ? onFocusOut : undefined}>
      {children}
    </View>
  )
}
