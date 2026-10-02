import type { ElementRef } from "../../utils/elementRef"
import { Text as OjsText, type TextProps as OjsTextProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Heading.module.uss"

export type HeadingLevel = 1 | 2 | 3

export interface HeadingProps extends OjsTextProps {
  /** The underlying UI Toolkit element, for measuring or anchoring an overlay to it. */
  ref?: ElementRef<"Text">
  /** Heading level (controls size). Default 2. */
  level?: HeadingLevel
}

const levelClass: Record<HeadingLevel, string> = {
  1: styles.h1,
  2: styles.h2,
  3: styles.h3,
}

/** Bold themed heading text. */
export function Heading({ level = 2, className, ...rest }: HeadingProps) {
  return <OjsText className={cx(styles.heading, levelClass[level], className)} {...rest} />
}
