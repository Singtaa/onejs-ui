import { Text as OjsText, type TextProps as OjsTextProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Text.module.uss"

export type TextSize = "sm" | "md" | "lg" | "xl"
export type TextTone = "default" | "muted" | "subtle"

export interface TextProps extends OjsTextProps {
  /** Type scale step. Defaults to `md`. */
  size?: TextSize
  /** Foreground tone. Defaults to `default`. */
  tone?: TextTone
}

const sizeClass: Record<TextSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
  lg: styles.lg,
  xl: styles.xl,
}

const toneClass: Record<TextTone, string | undefined> = {
  default: undefined,
  muted: styles.muted,
  subtle: styles.subtle,
}

/** Themed text. Reads color + size from theme tokens via USS classes. */
export function Text({ size = "md", tone = "default", className, ...rest }: TextProps) {
  return (
    <OjsText
      className={cx(styles.text, sizeClass[size], toneClass[tone], className)}
      {...rest}
    />
  )
}
