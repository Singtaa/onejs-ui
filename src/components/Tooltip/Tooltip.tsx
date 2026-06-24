import { useRef, useState, type ReactNode } from "react"
import { View, Text } from "onejs-react"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import styles from "./Tooltip.module.uss"

export interface TooltipProps {
  /** Text shown in the tooltip. */
  label: string
  /** The element the tooltip describes. */
  children: ReactNode
  /** Preferred placement relative to the child. Default "top". */
  placement?: OverlayPlacement
}

/**
 * Hover tooltip on the Overlay foundation. Shows on pointer enter, hides on leave;
 * no dismiss wiring since it's purely hover-driven.
 */
export function Tooltip({ label, children, placement = "top" }: TooltipProps) {
  const anchorRef = useRef<any>(null)
  const [open, setOpen] = useState(false)

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
