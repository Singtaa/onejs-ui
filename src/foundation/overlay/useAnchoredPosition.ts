import { useLayoutEffect, useRef, useState, type RefObject } from "react"

export type OverlaySide = "top" | "bottom" | "left" | "right"
export type OverlayAlign = "start" | "center" | "end"
export type OverlayPlacement = OverlaySide | `${OverlaySide}-${OverlayAlign}`

export interface AnchoredPositionOptions {
  /** Preferred side + alignment, e.g. "bottom", "bottom-start", "right-end". Default "bottom". */
  placement?: OverlayPlacement
  /** Gap between the anchor and the floating element, in px. Default 6. */
  offset?: number
  /** Minimum distance kept from the viewport edges, in px. Default 8. */
  padding?: number
  /** Flip to the opposite side when the preferred side would overflow. Default true. */
  flip?: boolean
}

export interface AnchoredPosition {
  x: number
  y: number
  /** The resolved placement after any flip. */
  placement: OverlayPlacement
  /** False until the floating element has been measured and positioned (avoids a flash at 0,0). */
  ready: boolean
}

interface Rect { x: number; y: number; width: number; height: number }

declare const __root: any

function readRect(el: any): Rect | null {
  try {
    const r = el?.worldBound
    if (!r) return null
    const { x, y, width, height } = r
    if (typeof x !== "number" || typeof width !== "number") return null
    return { x, y, width, height }
  } catch {
    return null
  }
}

const OPPOSITE: Record<OverlaySide, OverlaySide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
}

function place(anchor: Rect, floating: Rect, side: OverlaySide, align: OverlayAlign, offset: number) {
  let x = 0
  let y = 0
  if (side === "top") y = anchor.y - floating.height - offset
  else if (side === "bottom") y = anchor.y + anchor.height + offset
  else if (side === "left") x = anchor.x - floating.width - offset
  else if (side === "right") x = anchor.x + anchor.width + offset

  if (side === "top" || side === "bottom") {
    if (align === "start") x = anchor.x
    else if (align === "end") x = anchor.x + anchor.width - floating.width
    else x = anchor.x + anchor.width / 2 - floating.width / 2
  } else {
    if (align === "start") y = anchor.y
    else if (align === "end") y = anchor.y + anchor.height - floating.height
    else y = anchor.y + anchor.height / 2 - floating.height / 2
  }
  return { x, y }
}

function overflowsOnSide(x: number, y: number, floating: Rect, vp: Rect, padding: number, side: OverlaySide) {
  if (side === "top") return y < vp.y + padding
  if (side === "bottom") return y + floating.height > vp.y + vp.height - padding
  if (side === "left") return x < vp.x + padding
  return x + floating.width > vp.x + vp.width - padding
}

function clamp(v: number, min: number, max: number) {
  if (max < min) return min
  return v < min ? min : v > max ? max : v
}

function compute(anchorEl: any, floatingEl: any, opts: Required<AnchoredPositionOptions>): AnchoredPosition | null {
  const anchor = readRect(anchorEl)
  const floating = readRect(floatingEl)
  // Floating not laid out yet -> wait (next frame).
  if (!anchor || !floating || floating.width <= 0 || floating.height <= 0) return null
  const vp = readRect(typeof __root !== "undefined" ? __root : null) ?? { x: 0, y: 0, width: 1e5, height: 1e5 }

  const dash = opts.placement.indexOf("-")
  let side = (dash === -1 ? opts.placement : opts.placement.slice(0, dash)) as OverlaySide
  const align = (dash === -1 ? "center" : opts.placement.slice(dash + 1)) as OverlayAlign

  let { x, y } = place(anchor, floating, side, align, opts.offset)

  if (opts.flip && overflowsOnSide(x, y, floating, vp, opts.padding, side)) {
    const opp = OPPOSITE[side]
    const alt = place(anchor, floating, opp, align, opts.offset)
    if (!overflowsOnSide(alt.x, alt.y, floating, vp, opts.padding, opp)) {
      side = opp
      x = alt.x
      y = alt.y
    }
  }

  // Shift along both axes to keep the element inside the viewport.
  x = clamp(x, vp.x + opts.padding, vp.x + vp.width - floating.width - opts.padding)
  y = clamp(y, vp.y + opts.padding, vp.y + vp.height - floating.height - opts.padding)

  return { x, y, placement: align === "center" ? side : (`${side}-${align}` as OverlayPlacement), ready: true }
}

/**
 * Positions a floating element relative to an anchor, with flip (to the opposite
 * side on overflow) and shift (to stay within the panel). Returns coordinates in
 * panel space, suitable for `position: absolute; left/top` inside the overlay
 * layer (which covers the panel root).
 *
 * Tracks continuously via requestAnimationFrame so the floating element follows
 * the anchor through layout, scroll, and resize; state only updates when the
 * position actually changes.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<any>,
  floatingRef: RefObject<any>,
  options: AnchoredPositionOptions = {}
): AnchoredPosition {
  const opts: Required<AnchoredPositionOptions> = {
    placement: options.placement ?? "bottom",
    offset: options.offset ?? 6,
    padding: options.padding ?? 8,
    flip: options.flip ?? true,
  }

  const [pos, setPos] = useState<AnchoredPosition>({ x: 0, y: 0, placement: opts.placement, ready: false })
  const posRef = useRef(pos)
  posRef.current = pos

  useLayoutEffect(() => {
    let raf = 0
    const tick = () => {
      const next = compute(anchorRef.current, floatingRef.current, opts)
      if (next) {
        const cur = posRef.current
        if (!cur.ready || next.x !== cur.x || next.y !== cur.y || next.placement !== cur.placement) {
          setPos(next)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.placement, opts.offset, opts.padding, opts.flip])

  return pos
}
