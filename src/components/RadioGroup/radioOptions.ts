/** One choice in a RadioGroup, the same shape as a Select option. */
export interface RadioOption {
  /** What `value` and `onChange` speak. Unique within the group. */
  value: string
  /** The text drawn beside the radio. */
  label: string
  /** Drawn dimmed, cannot be chosen, and navigation steps over it. */
  disabled?: boolean
}

// The native RadioButtonGroup draws one radio per label and reports the chosen
// one by index. These translate between that and option values.

/** The labels the native group draws, in option order. */
export function optionLabels(options: readonly RadioOption[]): string[] {
  return options.map((o) => o.label)
}

/** The index of the option holding `value`, or -1 (nothing selected). */
export function optionIndex(options: readonly RadioOption[], value: string | undefined): number {
  if (value === undefined) return -1
  return options.findIndex((o) => o.value === value)
}

/** The value of the option at `index`, or undefined when it is out of range or disabled. */
export function optionValueAt(options: readonly RadioOption[], index: number): string | undefined {
  const option = options[index]
  return option && !option.disabled ? option.value : undefined
}
