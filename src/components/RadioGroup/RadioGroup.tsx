import { registerElement, createComponent } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./RadioGroup.module.uss"

declare const CS: any

// RadioButtonGroup isn't wired in onejs-react's reconciler, so register it once.
// It auto-creates a RadioButton per `choices` entry; `value` is the selected index.
registerElement("radio-button-group", CS.UnityEngine.UIElements.RadioButtonGroup)
const NativeRadioGroup = createComponent("radio-button-group")

export interface RadioGroupProps {
  /** Selected index, or -1 for none. */
  value?: number
  /** The option labels. */
  choices?: string[]
  /** Called with the newly selected index. */
  onChange?: (value: number) => void
  disabled?: boolean
  className?: string
}

/**
 * Radio group on the native UI Toolkit RadioButtonGroup (a proper focus target),
 * restyled with theme tokens. Controlled via `value` (index) + `onChange`.
 */
export function RadioGroup({ onChange, className, ...rest }: RadioGroupProps) {
  // The group's onChange also receives the individual RadioButtons' bool change
  // events (they bubble up). Only the group's own int change is the selection.
  const handleChange = onChange
    ? (e: any) => {
        if (typeof e?.value === "number") onChange(e.value)
      }
    : undefined
  return (
    <NativeRadioGroup
      className={cx(styles.radioGroup, className)}
      onChange={handleChange}
      {...(rest as any)}
    />
  )
}
