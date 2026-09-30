import { useEffect, type RefObject } from "react"
import { isOutsidePress } from "./outsidePress"

declare const __root: any

export interface DismissOptions {
  enabled?: boolean
  /** Dismiss on Escape. Default true. */
  escape?: boolean
  /** Dismiss on pointer press outside the floating element. Default true. */
  outsidePress?: boolean
  /**
   * Elements whose presses are not outside, typically the trigger. A press on
   * it bubbles to the panel root like any other, and counting it as outside
   * would close the overlay just before the trigger's click reopens it.
   */
  insideRefs?: ReadonlyArray<RefObject<any>>
}

/**
 * Dismisses an overlay on Escape and/or on a pointer press outside the floating
 * element. Uses global listeners on the panel root (via `__eventAPI`) so it works
 * even when the overlay is portaled out of the normal hierarchy.
 *
 * The listeners are attached in an effect, after the press that opened the
 * overlay has finished, so opening never immediately self-dismisses.
 */
const NO_REFS: ReadonlyArray<RefObject<any>> = []

export function useDismiss(
  floatingRef: RefObject<any>,
  onDismiss: (() => void) | undefined,
  { enabled = true, escape = true, outsidePress = true, insideRefs = NO_REFS }: DismissOptions = {}
): void {
  useEffect(() => {
    if (!enabled || !onDismiss) return
    if (typeof __root === "undefined" || typeof __eventAPI === "undefined") return

    const onKeyDown = (e: any) => {
      if (escape && e?.key === "Escape") onDismiss()
    }
    const onPointerDown = (e: any) => {
      const rects = [floatingRef, ...insideRefs].map((ref) => ref.current?.worldBound)
      if (isOutsidePress(e?.x ?? 0, e?.y ?? 0, rects)) onDismiss()
    }

    if (escape) __eventAPI.addEventListener(__root, "keydown", onKeyDown)
    if (outsidePress) __eventAPI.addEventListener(__root, "pointerdown", onPointerDown)

    return () => {
      if (escape) __eventAPI.removeEventListener(__root, "keydown", onKeyDown)
      if (outsidePress) __eventAPI.removeEventListener(__root, "pointerdown", onPointerDown)
    }
  }, [enabled, escape, outsidePress, onDismiss, floatingRef, insideRefs])
}
