import type { ElementRef } from "../../utils/elementRef"
import { View, Text, type ViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import type { StatusIntent } from "../../utils/intent"
import styles from "./Badge.module.uss"

/** @deprecated Use `StatusIntent`, the vocabulary Badge shares with Toast. */
export type BadgeIntent = StatusIntent

export interface BadgeProps extends ViewProps {
  /** The underlying UI Toolkit element, for measuring or anchoring an overlay to it. */
  ref?: ElementRef<"View">
  /** Status color, shared with Toast. Default "neutral". */
  intent?: StatusIntent
}

const intentClass: Record<StatusIntent, string | undefined> = {
  neutral: undefined,
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
}

/** Small pill label for statuses, counts, and tags. */
export function Badge({ intent = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <View className={cx(styles.badge, intentClass[intent], className)} {...rest}>
      <Text>{children}</Text>
    </View>
  )
}
