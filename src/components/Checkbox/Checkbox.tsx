import type { ElementRef } from "../../utils/elementRef"
import { Toggle, type ToggleProps as OjsToggleProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Checkbox.module.uss"

export interface CheckboxProps extends Omit<OjsToggleProps, "text" | "label" | "onChange"> {
  /** The underlying UI Toolkit element, for measuring or anchoring an overlay to it. */
  ref?: ElementRef<"Toggle">
  /** Label shown to the right of the box. */
  label?: string
  /** Called with the new checked state. */
  onChange?: (checked: boolean) => void
}

/**
 * Checkbox on the native UI Toolkit Toggle (a proper nav/pointer focus target),
 * restyled with theme tokens. Controlled via `value` + `onChange`.
 */
export function Checkbox({ label, onChange, className, ...rest }: CheckboxProps) {
  return (
    <Toggle
      text={label}
      className={cx(styles.checkbox, className)}
      onChange={onChange ? (e) => onChange(e.value) : undefined}
      {...rest}
    />
  )
}
