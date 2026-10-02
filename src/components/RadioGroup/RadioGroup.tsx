import { useLayoutEffect, useMemo, useRef } from "react"
import { registerElement, createComponent } from "onejs-react"
import { cx } from "../../utils/cx"
import { findRadioButtons } from "../../utils/radios"
import { useControllableState } from "../../foundation/state"
import { optionIndex, optionLabels, optionValueAt, type RadioOption } from "./radioOptions"
import styles from "./RadioGroup.module.uss"

declare const CS: any

// RadioButtonGroup isn't wired in onejs-react's reconciler, so register it once.
// It auto-creates a RadioButton per `choices` entry; `value` is the selected index.
registerElement("radio-button-group", CS.UnityEngine.UIElements.RadioButtonGroup)
const NativeRadioGroup = createComponent("radio-button-group")

interface RadioGroupCommonProps {
  /** VisualElement.name, for UQuery lookup (parity with the other controls). */
  name?: string
  /** Disables the whole group. To disable one choice, set `disabled` on its option. */
  disabled?: boolean
  className?: string
}

/** A RadioGroup that speaks option values, like Select. */
export interface RadioGroupOptionsProps extends RadioGroupCommonProps {
  /** The choices, in display order. */
  options: RadioOption[]
  /** The selected option's value (controlled). Omit it and the group owns its selection. */
  value?: string
  /** The initially selected option's value when uncontrolled. */
  defaultValue?: string
  /** Called with the chosen option's value. */
  onChange?: (value: string) => void
  choices?: never
}

/** @deprecated Use `options` with string values; see `RadioGroupOptionsProps`. */
export interface RadioGroupChoicesProps extends RadioGroupCommonProps {
  /** @deprecated Use `options: [{ value, label }]`. */
  choices?: string[]
  /** Selected index, or -1 for none. */
  value?: number
  /** Called with the newly selected index. */
  onChange?: (value: number) => void
  options?: never
  defaultValue?: never
}

export type RadioGroupProps = RadioGroupOptionsProps | RadioGroupChoicesProps

/**
 * Radio group on the native UI Toolkit RadioButtonGroup (a proper focus target),
 * restyled with theme tokens. Give it `options` and a string `value` with
 * `onChange(value)`, the same shape as Select, or leave `value` out and let it
 * own the selection from `defaultValue`. The older `choices` with a numeric
 * index still works and is deprecated.
 *
 * Keyboard focus ring: driven by the native `:focus` pseudo-state in the USS
 * (`.radioGroup.focus-ring .unity-radio-button:focus`), since UI Toolkit drives
 * intra-group navigation internally and surfaces no JS events for it (a JS class-toggled
 * ring would have no clearing event and stick). The ENTRY radio is handled by the
 * focus-visible manager, which calls `radio.Focus()` on the landing radio so it becomes
 * a real focus leaf with native `:focus` (see promoteRadioGroupEntry in focusVisible.ts).
 * That routes through the genuine focus path, so it rings on entry and self-clears on
 * exit without a stuck class: no core change (Singtaa/OneJS#109) required.
 */
export function RadioGroup(props: RadioGroupProps) {
  return props.options ? <OptionsRadioGroup {...props} /> : <ChoicesRadioGroup {...(props as RadioGroupChoicesProps)} />
}

function OptionsRadioGroup({ options, value, defaultValue, onChange, className, ...rest }: RadioGroupOptionsProps) {
  const ref = useRef<any>(null)
  // Nothing selected is `undefined`; only option values are ever chosen.
  const [selected, setSelected] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: onChange && ((next) => next !== undefined && onChange(next)),
  })

  // The group's change events also carry the individual RadioButtons' bool
  // changes (they bubble up). Only the group's own int change is the
  // selection, and an index that names no enabled option is not a choice.
  const handleChange = (e: any) => {
    if (typeof e?.value !== "number") return
    const next = optionValueAt(options, e.value)
    if (next !== undefined) setSelected(next)
  }

  // The native group builds its radios from `choices`, so per-option disabled
  // is applied to those radios once they exist. It reuses them by position
  // when the labels change, which is why this runs whenever either changes.
  const shape = JSON.stringify(options.map((o) => [o.label, !!o.disabled]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const labels = useMemo(() => optionLabels(options), [shape])
  useLayoutEffect(() => {
    findRadioButtons(ref.current).forEach((radio, i) => {
      try { radio.SetEnabled(!options[i]?.disabled) } catch {}
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape])

  // `choices` before `value`: see ChoicesRadioGroup.
  return (
    <NativeRadioGroup
      ref={ref}
      className={cx(styles.radioGroup, className)}
      onChange={handleChange}
      choices={labels}
      value={optionIndex(options, selected)}
      {...(rest as any)}
    />
  )
}

function ChoicesRadioGroup({ onChange, className, choices, value, ...rest }: RadioGroupChoicesProps) {
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
