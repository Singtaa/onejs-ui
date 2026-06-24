import { useEffect, type RefObject } from "react"

declare const __root: any

export interface DismissOptions {
  enabled?: boolean
  /** Dismiss on Escape. Default true. */
  escape?: boolean
  /** Dismiss on pointer press outside the floating element. Default true. */
  outsidePress?: boolean
}

function pointInRect(x: number, y: number, r: any): boolean {
  return r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
}

/**
 * Dismisses an overlay on Escape and/or on a pointer press outside the floating
 * element. Uses global listeners on the panel root (via `__eventAPI`) so it works
 * even when the overlay is portaled out of the normal hierarchy.
 *
 * The listeners are attached in an effect, after the press that opened the
 * overlay has finished, so opening never immediately self-dismisses.
 */
export function useDismiss(
  floatingRef: RefObject<any>,
  onDismiss: (() => void) | undefined,
  { enabled = true, escape = true, outsidePress = true }: DismissOptions = {}
): void {
  useEffect(() => {
    if (!enabled || !onDismiss) return
    if (typeof __root === "undefined" || typeof __eventAPI === "undefined") return

    const onKeyDown = (e: any) => {
      if (escape && e?.key === "Escape") onDismiss()
    }
    const onPointerDown = (e: any) => {
      const r = floatingRef.current?.worldBound
      if (!r || !pointInRect(e?.x ?? 0, e?.y ?? 0, r)) onDismiss()
    }

    if (escape) __eventAPI.addEventListener(__root, "keydown", onKeyDown)
    if (outsidePress) __eventAPI.addEventListener(__root, "pointerdown", onPointerDown)

    return () => {
      if (escape) __eventAPI.removeEventListener(__root, "keydown", onKeyDown)
      if (outsidePress) __eventAPI.removeEventListener(__root, "pointerdown", onPointerDown)
    }
  }, [enabled, escape, outsidePress, onDismiss, floatingRef])
}
