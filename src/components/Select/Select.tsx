import { useCallback, useRef, useState } from "react"
import { View, Text, type PointerEventData } from "onejs-react"
import { cx } from "../../utils/cx"
import { synthesizedClick } from "../../utils/synthesizedClick"
import { Button } from "../Button"
import { Overlay } from "../../foundation/overlay"
import { FocusScope, RING_CLASS } from "../../foundation/focus"
import { useMenuNavigation } from "../../foundation/menu"
import styles from "./Select.module.uss"

export interface SelectOption {
  label: string
  value: string
  /** Cannot be chosen, and the keyboard steps over it. */
  disabled?: boolean
}

export interface SelectProps {
  /** Selected option value. */
  value?: string
  /** The options to choose from. */
  options: SelectOption[]
  /**
   * Called with the chosen option's value, and the click that chose it. A
   * choice made from the keyboard or a gamepad passes a synthesised click with
   * `pointerId: -1`, the same shape Button hands its `onClick`.
   */
  onChange?: (value: string, event: PointerEventData) => void
  /** Text shown when nothing is selected. */
  placeholder?: string
  disabled?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
}

/**
 * Select built on the Overlay foundation: a focusable native-Button trigger plus
 * a portaled, anchored menu that flips/shifts and dismisses on outside-press or
 * Escape.
 *
 * Keyboard: opening the menu puts focus on it (FocusScope, which traps while
 * open and returns focus to the trigger on close). Up/Down move the highlight
 * and wrap, Home/End jump to the ends, Enter/Space/gamepad-South choose,
 * Escape closes. Disabled options are stepped over rather than highlighted. The
 * highlight is a class rather than real focus; see useMenuNavigation for why.
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

  // One path for both pointer and keyboard, so a consumer's handler cannot tell
  // which one chose the option except by reading the event it is handed.
  const choose = useCallback(
    (index: number, event: PointerEventData) => {
      const opt = options[index]
      if (!opt || opt.disabled) return
      onChange?.(opt.value, event)
      setOpen(false)
    },
    [options, onChange]
  )

  // Open onto the selected option so Up/Down continue from what is showing,
  // rather than from the top of the list.
  const selectedIndex = options.findIndex((o) => o.value === value)

  const { activeIndex, setActiveIndex, menuProps } = useMenuNavigation({
    open,
    count: options.length,
    isDisabled: (i) => !!options[i]?.disabled,
    onCommit: (index) => choose(index, synthesizedClick()),
    initialIndex: selectedIndex,
  })

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
        <FocusScope>
          <View className={cx(styles.menu, RING_CLASS)} {...menuProps}>
            {options.map((opt, i) => (
              <View
                key={opt.value}
                className={cx(
                  styles.option,
                  opt.value === value && styles.optionSelected,
                  i === activeIndex && styles.optionActive,
                  opt.disabled && styles.optionDisabled
                )}
                // Pointer and keyboard agree on which row is highlighted, so
                // moving the mouse after arrowing does not leave two rows lit.
                onPointerEnter={opt.disabled ? undefined : () => setActiveIndex(i)}
                onClick={opt.disabled ? undefined : (e) => choose(i, e)}
              >
                <Text className={styles.optionText}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </FocusScope>
      </Overlay>
    </View>
  )
}
