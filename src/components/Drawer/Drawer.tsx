import { useRef, type ReactNode } from "react"
import { View, Text, Portal } from "onejs-react"
import { cx } from "../../utils/cx"
import { Scrim, useDismiss } from "../../foundation/overlay"
import { FocusScope } from "../../foundation/focus"
import { usePresence, motion } from "../../foundation/motion"
import { useOpenState } from "../../foundation/state"
import styles from "./Drawer.module.uss"

export type DrawerSide = "left" | "right" | "top" | "bottom"

const PANEL_SIDE: Record<DrawerSide, string> = {
  left: styles.panelLeft,
  right: styles.panelRight,
  top: styles.panelTop,
  bottom: styles.panelBottom,
}
const PANEL_OPEN: Record<DrawerSide, string> = {
  left: styles.openLeft,
  right: styles.openRight,
  top: styles.openTop,
  bottom: styles.openBottom,
}
const PANEL_CLOSED: Record<DrawerSide, string> = {
  left: styles.closedLeft,
  right: styles.closedRight,
  top: styles.closedTop,
  bottom: styles.closedBottom,
}

export interface DrawerProps {
  /** Controlled open state. Omit it and the drawer owns its open state. */
  open?: boolean
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean
  /** Called with `false` when the drawer asks to close (Escape or a backdrop press). */
  onOpenChange?: (open: boolean) => void
  /** @deprecated Use `onOpenChange`, which is called with `false` whenever this is. */
  onClose?: () => void
  /** Edge the drawer slides in from. Default "right". */
  side?: DrawerSide
  title?: string
  children?: ReactNode
  dismissOnEscape?: boolean
  /** Close on a press outside the panel (the backdrop). Default true. */
  dismissOnScrimClick?: boolean
  className?: string
}

// Match the slide transition (--ojs-motion-slow) so exit completes before unmount.
const EXIT_MS = 280

/**
 * Edge-anchored sliding panel with a dimming scrim, on the overlay foundation.
 * Slides in from `side` via a `translate` transition, traps focus (FocusScope),
 * and dismisses on Escape / backdrop press.
 */
export function Drawer({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onClose,
  side = "right",
  title,
  children,
  dismissOnEscape = true,
  dismissOnScrimClick = true,
  className,
}: DrawerProps) {
  const panelRef = useRef<any>(null)
  const { open, close } = useOpenState({ open: openProp, defaultOpen, onOpenChange, onClose })
  const { mounted, status } = usePresence(open, EXIT_MS)

  // Escape via the global key path; outside-press is handled by the scrim's own
  // click (a real element event: reliable across the portal boundary).
  useDismiss(panelRef, close, {
    enabled: open,
    escape: dismissOnEscape,
    outsidePress: false,
  })

  if (!mounted) return null
  const open_ = status === "open"

  return (
    <Portal>
      <Scrim
        className={cx(motion.fade, open_ ? motion.fadeOpen : motion.fadeClosed)}
        onClick={dismissOnScrimClick ? close : undefined}
      />
      <View
        ref={panelRef}
        className={cx(styles.panel, PANEL_SIDE[side], open_ ? PANEL_OPEN[side] : PANEL_CLOSED[side], className)}
      >
        <FocusScope>
          {title ? <Text className={styles.title}>{title}</Text> : null}
          {children}
        </FocusScope>
      </View>
    </Portal>
  )
}
