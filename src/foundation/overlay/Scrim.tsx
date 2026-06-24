import { View, type ViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./overlay.module.uss"

export interface ScrimProps extends ViewProps {}

/** Full-screen dimmed backdrop for modal overlays. Render inside a Portal. */
export function Scrim({ className, ...rest }: ScrimProps) {
  return <View className={cx(styles.scrim, className)} {...rest} />
}
