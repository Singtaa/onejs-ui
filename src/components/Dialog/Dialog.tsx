import { useRef, type ReactNode } from "react"
import { View, Text, Portal } from "onejs-react"
import { cx } from "../../utils/cx"
import { Scrim, useDismiss } from "../../foundation/overlay"
import { FocusScope } from "../../foundation/focus"
import { usePresence, motion } from "../../foundation/motion"
import { useOpenState } from "../../foundation/state"
import styles from "./Dialog.module.uss"

export interface DialogProps {
  /** Controlled open state. Omit it and the dialog owns its open state. */
  open?: boolean
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean
  /** Called with `false` when the dialog asks to close (Escape or a backdrop press). */
  onOpenChange?: (open: boolean) => void
  /** @deprecated Use `onOpenChange`, which is called with `false` whenever this is. */
  onClose?: () => void
  /** Optional heading rendered at the top of the panel. */
  title?: string
  children?: ReactNode
  /** Close on Escape. Default true. */
  dismissOnEscape?: boolean
  /** Close on a press outside the panel (the backdrop). Default true. */
  dismissOnScrimClick?: boolean
  /** Class applied to the panel. */
  className?: string
}

// Slightly longer than the scale-fade (--ojs-motion-base) so exit completes.
const EXIT_MS = 200

/**
 * Centered modal dialog: a dimmed scrim, a scale-fading panel, focus trapped via
 * FocusScope, and dismissal on Escape / backdrop press. The scrim centers the
 * panel and `useDismiss` target-checks the panel ref, so presses inside the panel
 * never close it.
 */
export function Dialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onClose,
  title,
  children,
  dismissOnEscape = true,
  dismissOnScrimClick = true,
  className,
}: DialogProps) {
  const panelRef = useRef<any>(null)
  const { open, close } = useOpenState({ open: openProp, defaultOpen, onOpenChange, onClose })
  const { mounted, status } = usePresence(open, EXIT_MS)

  // Escape via the global key path; backdrop dismissal is the scrim's own click.
  // The panel stops click propagation so inside-clicks don't reach the scrim.
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
        className={cx(styles.scrimCenter, motion.fade, open_ ? motion.fadeOpen : motion.fadeClosed)}
        onClick={dismissOnScrimClick ? close : undefined}
      >
        <View
          ref={panelRef}
          onClick={(e: any) => e.stopPropagation()}
          className={cx(
            styles.panel,
            motion.scaleFade,
            open_ ? motion.scaleFadeOpen : motion.scaleFadeClosed,
            className
          )}
        >
          <FocusScope>
            {title ? <Text className={styles.title}>{title}</Text> : null}
            {children}
          </FocusScope>
        </View>
      </Scrim>
    </Portal>
  )
}
