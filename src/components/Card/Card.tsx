import { View, type ViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Card.module.uss"

export type CardVariant = "surface" | "raised"

export interface CardProps extends ViewProps {
  /** Surface elevation. Defaults to `surface`. */
  variant?: CardVariant
}

/** Themed surface container: background, border, radius, and padding from tokens. */
export function Card({ variant = "surface", className, ...rest }: CardProps) {
  return (
    <View
      className={cx(styles.card, variant === "raised" && styles.raised, className)}
      {...rest}
    />
  )
}
