import { TextField, type TextFieldProps as OjsTextFieldProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Input.module.uss"

export interface InputProps extends Omit<OjsTextFieldProps, "onChange"> {
  /** Called with the new text value. */
  onChange?: (value: string) => void
}

/**
 * Text input on the native UI Toolkit TextField (a proper focus target with full
 * text editing/caret/IME), restyled with theme tokens. Controlled via `value` +
 * `onChange`. Supports `multiline`, `password`, `maxLength`, etc. from TextField.
 */
export function Input({ onChange, className, ...rest }: InputProps) {
  return (
    <TextField
      className={cx(styles.input, className)}
      onChange={onChange ? (e) => onChange(e.value) : undefined}
      {...rest}
    />
  )
}
