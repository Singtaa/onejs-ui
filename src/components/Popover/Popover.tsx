import { useRef, useState, type ReactNode } from "react"
import { View } from "onejs-react"
import { cx } from "../../utils/cx"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import styles from "./Popover.module.uss"

export interface PopoverProps {
  /** The element that toggles the popover when clicked. */
  trigger: ReactNode
  children?: ReactNode
  /** Preferred placement relative to the trigger. Default "bottom". */
  placement?: OverlayPlacement
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Class applied to the floating panel. */
  className?: string
}

/**
 * Anchored floating panel on the Overlay foundation: a click-toggled trigger plus
 * a portaled panel that flips/shifts to stay on-screen and dismisses on
 * outside-press or Escape. Works controlled (`open`/`onOpenChange`) or not.
 */
export function Popover({
  trigger,
  children,
  placement = "bottom",
  open,
  onOpenChange,
  defaultOpen = false,
  className,
}: PopoverProps) {
  const anchorRef = useRef<any>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const setOpen = (v: boolean) => {
    onOpenChange?.(v)
    if (open === undefined) setUncontrolled(v)
  }

  return (
    <>
      <View ref={anchorRef} style={{ alignSelf: "flex-start" }} onClick={() => setOpen(!isOpen)}>
        {trigger}
      </View>
      <Overlay
        anchorRef={anchorRef}
        open={isOpen}
        placement={placement}
        onDismiss={() => setOpen(false)}
      >
        <View className={cx(styles.panel, className)}>{children}</View>
      </Overlay>
    </>
  )
}
