/** A laid-out element's panel rect, as `worldBound` gives it. */
export interface PanelRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Whether a press at panel point (x, y) lands outside every given rect. The
 * rects are the overlay's own panel and the elements that control it (its
 * trigger), so pressing either leaves the overlay to its own handlers.
 */
export function isOutsidePress(x: number, y: number, rects: ReadonlyArray<PanelRect | null | undefined>): boolean {
  for (const r of rects) {
    if (r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return false
  }
  return true
}
