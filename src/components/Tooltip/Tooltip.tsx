import { useRef, type ReactNode } from "react"
import { View, Text } from "onejs-react"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import { useOpenState } from "../../foundation/state"
import styles from "./Tooltip.module.uss"

export interface TooltipProps {
  /** Text shown in the tooltip. */
  label: string
  /** The element the tooltip describes. */
  children: ReactNode
  /** Preferred placement relative to the child. Default "top". */
  placement?: OverlayPlacement
  /** Controlled visibility. Omit it and the tooltip shows while the pointer is over the child. */
  open?: boolean
  /** Initial visibility when uncontrolled. Default false. */
  defaultOpen?: boolean
  /** Called with `true` when the pointer enters the child and `false` when it leaves. */
  onOpenChange?: (open: boolean) => void
}

/**
 * Hover tooltip on the Overlay foundation. Shows on pointer enter, hides on
 * leave; no Escape or outside press dismissal, since hover drives it. Pass
 * `open` to show it from elsewhere, such as while its control has focus.
 */
export function Tooltip({
  label,
  children,
  placement = "top",
  open: openProp,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const anchorRef = useRef<any>(null)
  const { open, setOpen } = useOpenState({ open: openProp, defaultOpen, onOpenChange })

  return (
    <View
      ref={anchorRef}
      style={{ alignSelf: "flex-start" }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      {children}
      <Overlay
        anchorRef={anchorRef}
        open={open}
        placement={placement}
        offset={6}
        dismissOnOutsidePress={false}
        dismissOnEscape={false}
      >
        <View className={styles.tooltip}>
          <Text className={styles.text}>{label}</Text>
        </View>
      </Overlay>
    </View>
  )
}
