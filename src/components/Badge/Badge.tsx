import { View, Text, type ViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Badge.module.uss"

export type BadgeIntent = "neutral" | "primary" | "success" | "warning" | "danger"

export interface BadgeProps extends ViewProps {
  /** Color intent. Default "neutral". */
  intent?: BadgeIntent
}

const intentClass: Record<BadgeIntent, string | undefined> = {
  neutral: undefined,
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

/** Small pill label for statuses, counts, and tags. */
export function Badge({ intent = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <View className={cx(styles.badge, intentClass[intent], className)} {...rest}>
      <Text>{children}</Text>
    </View>
  )
}
