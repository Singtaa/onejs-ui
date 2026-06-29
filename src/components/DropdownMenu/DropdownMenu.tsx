import { createContext, useContext, useRef, useState, type ReactNode } from "react"
import { View, Text } from "onejs-react"
import { cx } from "../../utils/cx"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import styles from "./DropdownMenu.module.uss"

interface MenuContextValue {
  close: () => void
}
const MenuContext = createContext<MenuContextValue>({ close: () => {} })

export interface DropdownMenuProps {
  /** Element that toggles the menu when clicked. */
  trigger: ReactNode
  /** MenuItem / MenuSeparator children. */
  children?: ReactNode
  /** Preferred placement relative to the trigger. Default "bottom-start". */
  placement?: OverlayPlacement
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  className?: string
}

/**
 * Action menu on the Overlay foundation: a click-toggled trigger and a portaled,
 * anchored list of MenuItems that dismisses on select, outside-press, or Escape.
 * Pointer-driven; in-menu keyboard navigation is not yet supported (Singtaa/OneJS#110).
 */
export function DropdownMenu({
  trigger,
  children,
  placement = "bottom-start",
  open,
  onOpenChange,
  defaultOpen = false,
  className,
}: DropdownMenuProps) {
  const anchorRef = useRef<any>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const setOpen = (v: boolean) => {
    onOpenChange?.(v)
    if (open === undefined) setUncontrolled(v)
  }

  return (
    <>
      <View ref={anchorRef} style={{ alignSelf: "flex-start" }} onClick={() => setOpen(!isOpen)}>
        {trigger}
      </View>
      <Overlay
        anchorRef={anchorRef}
        open={isOpen}
        placement={placement}
        onDismiss={() => setOpen(false)}
      >
        <View className={cx(styles.menu, className)}>
          <MenuContext.Provider value={{ close: () => setOpen(false) }}>
            {children}
          </MenuContext.Provider>
        </View>
      </Overlay>
    </>
  )
}

export interface MenuItemProps {
  children?: ReactNode
  /** Called when the item is chosen; the menu closes afterward. */
  onSelect?: () => void
  disabled?: boolean
  /** Render as a destructive action (danger-colored text). */
  danger?: boolean
}

/** A selectable row inside a DropdownMenu. Closes the menu on select. */
export function MenuItem({ children, onSelect, disabled, danger }: MenuItemProps) {
  const { close } = useContext(MenuContext)
  return (
    <View
      className={cx(styles.item, danger && styles.itemDanger, disabled && styles.itemDisabled)}
      onClick={
        disabled
          ? undefined
          : () => {
              onSelect?.()
              close()
            }
      }
    >
      <Text className={styles.itemText}>{children}</Text>
    </View>
  )
}

/** A thin divider between groups of MenuItems. */
export function MenuSeparator() {
  return <View className={styles.separator} />
}
