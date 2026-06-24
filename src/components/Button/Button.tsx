import { useCallback, useRef } from "react"
import {
  Button as OjsButton,
  type ButtonProps as OjsButtonProps,
  type KeyEventData,
  type NavigationEventData,
} from "onejs-react"
import { cx } from "../../utils/cx"
import styles from "./Button.module.uss"

export type ButtonIntent = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends OjsButtonProps {
  /** Visual intent. Defaults to `primary`. */
  intent?: ButtonIntent
  /** Size step. Defaults to `md`. */
  size?: ButtonSize
}

const intentClass: Record<ButtonIntent, string | undefined> = {
  primary: undefined,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
}

const sizeClass: Record<ButtonSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
  lg: styles.lg,
}

/**
 * Themed button on the native UI Toolkit Button, which (unlike a raw View) is a
 * proper navigation/pointer focus target — so the focus ring follows keyboard,
 * gamepad, and pointer focus. The default theme's button-state rules were lowered
 * to single-class specificity so these token-driven rules win.
 *
 * Activation: pointer `onClick`, plus `NavigationSubmit` (Enter and gamepad South)
 * and Space/Enter keydown all invoke `onClick`.
 */
export function Button({
  intent = "primary",
  size = "md",
  className,
  onClick,
  onKeyDown,
  onNavigationSubmit,
  disabled,
  ...rest
}: ButtonProps) {
  // Guards against one press arriving as both a NavigationSubmit and a KeyDown.
  const activatingRef = useRef(false)

  const activate = useCallback(() => {
    if (disabled || activatingRef.current) return
    activatingRef.current = true
    requestAnimationFrame(() => {
      activatingRef.current = false
    })
    onClick?.({ type: "click", x: 0, y: 0, button: 0, pointerId: -1, modifiers: 0 })
  }, [onClick, disabled])

  const handleNavigationSubmit = useCallback(
    (e: NavigationEventData) => {
      activate()
      onNavigationSubmit?.(e)
    },
    [activate, onNavigationSubmit]
  )

  const handleKeyDown = useCallback(
    (e: KeyEventData) => {
      if (e.key === "Space" || e.key === "Return" || e.key === "KeypadEnter") {
        activate()
      }
      onKeyDown?.(e)
    },
    [activate, onKeyDown]
  )

  return (
    <OjsButton
      className={cx(styles.button, intentClass[intent], sizeClass[size], className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onNavigationSubmit={handleNavigationSubmit}
      disabled={disabled}
      {...rest}
    />
  )
}
