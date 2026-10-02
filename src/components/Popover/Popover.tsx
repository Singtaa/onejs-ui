import { useRef, type ReactNode } from "react"
import { View } from "onejs-react"
import { cx } from "../../utils/cx"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import { useTriggerActivation } from "../../foundation/overlay/useTriggerActivation"
import { useOpenState } from "../../foundation/state"
import styles from "./Popover.module.uss"

export interface PopoverProps {
  /** The element that toggles the popover when clicked. */
  trigger: ReactNode
  children?: ReactNode
  /** Preferred placement relative to the trigger. Default "bottom". */
  placement?: OverlayPlacement
  /** Controlled open state. Omit it and the popover owns its open state. */
  open?: boolean
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean
  /** Called with the requested open state: the trigger toggles, a dismissal closes. */
  onOpenChange?: (open: boolean) => void
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
  defaultOpen,
  className,
}: PopoverProps) {
  const anchorRef = useRef<any>(null)
  const { open: isOpen, setOpen } = useOpenState({ open, defaultOpen, onOpenChange })

  const triggerProps = useTriggerActivation(() => setOpen(!isOpen))

  return (
    <>
      <View ref={anchorRef} style={{ alignSelf: "flex-start" }} {...triggerProps}>
        {trigger}
      </View>
      <Overlay
        anchorRef={anchorRef}
        open={isOpen}
        placement={placement}
        onOpenChange={setOpen}
      >
        <View className={cx(styles.panel, className)}>{children}</View>
      </Overlay>
    </>
  )
}
