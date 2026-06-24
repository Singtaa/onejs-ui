import { Slider as OjsSlider, type SliderProps as OjsSliderProps } from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Slider.module.uss"

export interface SliderProps extends Omit<OjsSliderProps, "onChange"> {
  /** Called with the new value. */
  onChange?: (value: number) => void
}

/**
 * Slider on the native UI Toolkit Slider (a proper focus target with pointer drag
 * + keyboard/gamepad nudge), restyled with theme tokens. Controlled via `value` +
 * `onChange`; set the range with `lowValue` / `highValue`.
 */
export function Slider({ onChange, className, ...rest }: SliderProps) {
  return (
    <OjsSlider
      className={cx(styles.slider, className)}
      onChange={onChange ? (e) => onChange(e.value) : undefined}
      {...rest}
    />
  )
}
