import type { VisualElement } from "onejs-react"

// The render root (Unity panel root). Its focusController owns the panel's focus.
declare const __root: any

/** The element that currently has focus in the panel, or null. */
export function getFocusedElement(): VisualElement | null {
  try {
    return (__root?.focusController?.focusedElement as VisualElement) ?? null
  } catch {
    return null
  }
}

/** Focus an element, ignoring nulls and destroyed proxies. */
export function focusElement(el: VisualElement | null | undefined): void {
  try {
    el?.Focus?.()
  } catch {
    // Element may have been unmounted/destroyed; ignore.
  }
}

/** Whether two element proxies refer to the same underlying VisualElement. */
export function isSameElement(a: any, b: any): boolean {
  if (!a || !b) return false
  if (a === b) return true
  const ha = a.__csHandle, hb = b.__csHandle
  return ha != null && ha === hb
}

/** Whether `el` is `root` or a descendant of it (walks the parent chain). */
export function isWithin(root: any, el: any): boolean {
  if (!root || !el) return false
  let cur = el
  let guard = 0
  while (cur && guard++ < 1000) {
    if (isSameElement(cur, root)) return true
    try {
      cur = cur.parent
    } catch {
      return false
    }
  }
  return false
}

/**
 * Depth-first search for the first focusable descendant of `root` (excluding
 * `root` itself). Crosses the bridge per element, so intended for one-shot use
 * (autofocus on open), not per-frame.
 */
export function findFirstFocusable(root: any): VisualElement | null {
  if (!root) return null
  const stack: any[] = [root]
  while (stack.length > 0) {
    const el = stack.shift()
    try {
      if (el !== root && el.focusable) return el as VisualElement
    } catch {
      continue
    }
    try {
      const count = el.childCount ?? 0
      // Push children in order so the search stays document-order.
      for (let i = count - 1; i >= 0; i--) {
        const child = el[i]
        if (child) stack.unshift(child)
      }
    } catch {
      // No children / not enumerable.
    }
  }
  return null
}

/** Focus the first focusable descendant of `root`. Returns true if one was focused. */
export function focusFirstIn(root: any): boolean {
  const target = findFirstFocusable(root)
  if (target) {
    focusElement(target)
    return true
  }
  return false
}
