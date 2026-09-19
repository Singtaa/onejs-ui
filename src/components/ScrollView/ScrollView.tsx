import { ScrollView as OjsScrollView, type ScrollViewProps as OjsScrollViewProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./ScrollView.module.uss"

export interface ScrollViewProps extends OjsScrollViewProps {}

/**
 * ScrollView on the native UI Toolkit ScrollView (wheel / drag / elastic
 * scrolling), restyled with theme tokens. Children fill the viewport and the
 * themed scrollbar shows when content overflows; `mode` (default "Vertical"),
 * `verticalScrollerVisibility`, etc. come straight from `onejs-react`.
 */
export function ScrollView({ className, ...rest }: ScrollViewProps) {
  return <OjsScrollView className={cx(styles.scrollView, className)} {...rest} />
}
