import { useRef, useState } from "react"
import { View, Text } from "onejs-react"
import { cx } from "../../utils/cx"
import { Button } from "../Button"
import { Overlay } from "../../foundation/overlay"
import styles from "./Select.module.uss"

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  /** Selected option value. */
  value?: string
  /** The options to choose from. */
  options: SelectOption[]
  /** Called with the chosen option's value. */
  onChange?: (value: string) => void
  /** Text shown when nothing is selected. */
  placeholder?: string
  disabled?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
}

/**
 * Select built on the Overlay foundation: a focusable native-Button trigger plus
 * a portaled, anchored menu that flips/shifts and dismisses on outside-press or
 * Escape. Pointer-driven; in-menu keyboard navigation lands with the focus
 * manager (see issue #108).
 */
export function Select({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled,
  defaultOpen = false,
}: SelectProps) {
  const anchorRef = useRef<any>(null)
  const [open, setOpen] = useState(defaultOpen)
  const selected = options.find((o) => o.value === value)

  return (
    <View ref={anchorRef}>
      <Button intent="secondary" disabled={disabled} onClick={() => setOpen((o) => !o)}>
        <View className={styles.trigger}>
          <Text className={styles.triggerLabel}>{selected?.label ?? placeholder}</Text>
          <Text className={styles.caret}>⌄</Text>
        </View>
      </Button>

      <Overlay
        anchorRef={anchorRef}
        open={open}
        placement="bottom-start"
        offset={4}
        onDismiss={() => setOpen(false)}
      >
        <View className={styles.menu}>
          {options.map((opt) => (
            <View
              key={opt.value}
              className={cx(styles.option, opt.value === value && styles.optionSelected)}
              onClick={() => {
                onChange?.(opt.value)
                setOpen(false)
              }}
            >
              <Text className={styles.optionText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </Overlay>
    </View>
  )
}
