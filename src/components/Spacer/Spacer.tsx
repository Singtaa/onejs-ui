import { View } from "onejs-react"

export interface SpacerProps {
  /** Fixed size in px. When omitted, the spacer flexes to fill available space. */
  size?: number
}

/** Flexible (or fixed) empty space inside a Stack/flex container. */
export function Spacer({ size }: SpacerProps) {
  return (
    <View
      style={
        size != null
          ? { width: size, height: size, flexShrink: 0, flexGrow: 0 }
          : { flexGrow: 1, flexShrink: 1 }
      }
    />
  )
}
