import type { PointerEventData } from "onejs-react"

/**
 * The click payload a control hands to `onClick` when it was activated from the
 * keyboard or a gamepad rather than by a pointer.
 *
 * Keyboard and gamepad activation has no pointer, so every coordinate is zero,
 * the local ones included: `localX` and `localY` are measured from the
 * element's own box and there is no position to measure. `pointerId: -1` is
 * what marks the activation as synthesised, so a handler that needs to tell
 * them apart reads that rather than inferring it from the zeros, which a real
 * press on the very top left corner would also produce.
 *
 * Shared rather than written out at each call site so that every control
 * activated without a pointer hands its handler the same shape. Button was the
 * first to need it; the menus commit their highlighted row through the same
 * path so a consumer's option handler cannot tell which control synthesised it.
 */
export function synthesizedClick(): PointerEventData {
    return { type: "click", x: 0, y: 0, localX: 0, localY: 0, button: 0, pointerId: -1, modifiers: 0 }
}
