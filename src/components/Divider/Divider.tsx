import { View, type ViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Divider.module.uss"

export interface DividerProps extends ViewProps {
  /** Line orientation. Default "horizontal". */
  orientation?: "horizontal" | "vertical"
}

/** A 1px separator line in the theme's border color. */
export function Divider({ orientation = "horizontal", className, ...rest }: DividerProps) {
  return (
    <View
      className={cx(orientation === "vertical" ? styles.vertical : styles.horizontal, className)}
      {...rest}
    />
  )
}
