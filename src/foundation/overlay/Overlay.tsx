import { useRef, type ReactNode, type RefObject } from "react"
import { View, Portal } from "onejs-react"
import { cx } from "../../utils/cx"
import { usePresence, motion } from "../motion"
import { useAnchoredPosition, type OverlayPlacement } from "./useAnchoredPosition"
import { useDismiss } from "./useDismiss"
import { Scrim } from "./Scrim"

export interface OverlayProps {
  /** Ref to the element the overlay is positioned against. */
  anchorRef: RefObject<any>
  /** Whether the overlay is shown. */
  open: boolean
  /** Called when the overlay requests to close (scrim/outside press, Escape). */
  onDismiss?: () => void
  /** Preferred placement relative to the anchor. Default "bottom". */
  placement?: OverlayPlacement
  /** Gap between anchor and overlay, in px. Default 6. */
  offset?: number
  /** Render a dimmed full-screen backdrop behind the overlay (modal). Default false. */
  scrim?: boolean
  /** Dismiss on a pointer press outside the overlay. Ignored when `scrim` is set. Default true. */
  dismissOnOutsidePress?: boolean
  /** Dismiss on Escape. Default true. */
  dismissOnEscape?: boolean
  children?: ReactNode
}

// Slightly longer than the fade transition (--ojs-motion-base ~180ms) so exit
// completes before unmount.
const EXIT_MS = 200

/**
 * Foundation for anchored overlays (popover, dropdown, menu, tooltip). Portals
 * its children into the shared overlay layer, positions them against `anchorRef`
 * with flip/shift, fades them in/out, and wires Escape / outside-press / scrim
 * dismissal. Kept hidden until measured so it never flashes at the top-left.
 */
export function Overlay({
  anchorRef,
  open,
  onDismiss,
  placement,
  offset,
  scrim = false,
  dismissOnOutsidePress = true,
  dismissOnEscape = true,
  children,
}: OverlayProps) {
  const floatingRef = useRef<any>(null)
  const { mounted, status } = usePresence(open, EXIT_MS)
  const pos = useAnchoredPosition(anchorRef, floatingRef, { placement, offset })

  useDismiss(floatingRef, onDismiss, {
    enabled: open,
    escape: dismissOnEscape,
    outsidePress: dismissOnOutsidePress && !scrim,
  })

  if (!mounted) return null

  const open_ = status === "open"
  // Only fade in once positioned, so it never animates from the corner.
  const visible = open_ && pos.ready

  return (
    <Portal>
      {scrim ? (
        <Scrim
          className={cx(motion.fade, open_ ? motion.fadeOpen : motion.fadeClosed)}
          onClick={onDismiss}
        />
      ) : null}
      <View
        ref={floatingRef}
        className={cx(motion.fade, visible ? motion.fadeOpen : motion.fadeClosed)}
        style={{ position: "absolute", left: pos.x, top: pos.y }}
      >
        {children}
      </View>
    </Portal>
  )
}
