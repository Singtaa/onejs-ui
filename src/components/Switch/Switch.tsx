import { Toggle, type ToggleProps as OjsToggleProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Switch.module.uss"

export interface SwitchProps extends Omit<OjsToggleProps, "text" | "onChange"> {
  /** Label rendered to the left of the switch. */
  label?: string
  /** Called with the new on/off state. */
  onChange?: (checked: boolean) => void
}

/**
 * Switch on the native UI Toolkit Toggle. The toggle's input area is restyled as
 * a track and its checkmark as a knob that slides on `:checked`. Controlled via
 * `value` + `onChange`.
 */
export function Switch({ onChange, className, ...rest }: SwitchProps) {
  return (
    <Toggle
      className={cx(styles.switch, className)}
      onChange={onChange ? (e) => onChange(e.value) : undefined}
      {...rest}
    />
  )
}
