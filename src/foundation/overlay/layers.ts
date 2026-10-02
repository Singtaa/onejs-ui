import { useLayoutEffect, useRef } from "react"

/**
 * The open overlays, in the order they opened. Escape and an outside press
 * belong to the last one: a Select open inside a Dialog closes on Escape, and
 * the Dialog stays.
 */
const stack: object[] = []

export function pushLayer(layer: object): void {
  if (!stack.includes(layer)) stack.push(layer)
}

export function removeLayer(layer: object): void {
  const i = stack.indexOf(layer)
  if (i >= 0) stack.splice(i, 1)
}

export function isTopLayer(layer: object): boolean {
  return stack.length > 0 && stack[stack.length - 1] === layer
}

/**
 * Registers the calling overlay as a layer while `active`, and returns a check
 * for whether it is currently the top one. Read the check inside an event
 * handler, not during render.
 */
export function useLayer(active: boolean): () => boolean {
  const layer = useRef<object>({}).current
  useLayoutEffect(() => {
    if (!active) return
    pushLayer(layer)
    return () => removeLayer(layer)
  }, [active, layer])
  return () => isTopLayer(layer)
}
