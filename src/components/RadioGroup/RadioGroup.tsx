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
 * Keyboard focus ring: driven by the native `:focus` pseudo-state in the USS
 * (`.radioGroup.focus-ring .unity-radio-button:focus`), since UI Toolkit drives
 * intra-group navigation internally and surfaces no JS events for it (a JS class-toggled
 * ring would have no clearing event and stick). The ENTRY radio is handled by the
 * focus-visible manager, which calls `radio.Focus()` on the landing radio so it becomes
 * a real focus leaf with native `:focus` (see promoteRadioGroupEntry in focusVisible.ts).
 * That routes through the genuine focus path, so it rings on entry and self-clears on
 * exit without a stuck class — no core change (Singtaa/OneJS#109) required.
 */
export function RadioGroup({ onChange, className, choices, value, ...rest }: RadioGroupProps) {
  // The group's onChange also receives the individual RadioButtons' bool change
  // events (they bubble up). Only the group's own int change is the selection.
  const handleChange = onChange
    ? (e: any) => {
        if (typeof e?.value === "number") onChange(e.value)
      }
    : undefined

  // `choices` before `value`: the reconciler applies custom props in author order, and
  // `value` (selected index) must be set AFTER the RadioButtons exist or the initial
  // selection is dropped/clamped (the group has no children yet). Pinning the order here
  // makes initial selection independent of how the caller writes the props.
  return (
    <NativeRadioGroup
      className={cx(styles.radioGroup, className)}
      onChange={handleChange}
      choices={choices}
      value={value}
      {...(rest as any)}
    />
  )
}
