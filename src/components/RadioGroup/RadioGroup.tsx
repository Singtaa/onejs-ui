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
 *
 * Keyboard focus ring: driven purely by the native `:focus` pseudo-state in the USS
 * (`.radioGroup.focus-ring .unity-radio-button:focus`). UI Toolkit drives intra-group
 * navigation internally and surfaces NO JS events for it (only a single FocusInEvent
 * on the radio you first enter, never a matching blur), so a JS class-toggled ring
 * cannot be cleared and would stick. The native rule rings whichever radio you arrow
 * to and clears on exit. Trade-off: the radio you first land on isn't ringed until you
 * move once — fixing that needs a core subtree-style-recompute (Singtaa/OneJS#109).
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
