import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { View, Text, type PointerEventData } from "onejs-react"
import { cx } from "../../utils/cx"
import { synthesizedClick } from "../../utils/synthesizedClick"
import { Overlay, type OverlayPlacement } from "../../foundation/overlay"
import { FocusScope, RING_CLASS } from "../../foundation/focus"
import { useMenuNavigation } from "../../foundation/menu"
import styles from "./DropdownMenu.module.uss"

/** What a MenuItem registers about itself so the menu can drive it by index. */
interface MenuItemEntry {
  id: number
  disabled: boolean
  select: (event: PointerEventData) => void
}

interface MenuContextValue {
  close: () => void
  /** Registers a row and returns its unregister. Order of calls is row order. */
  register: (entry: MenuItemEntry) => () => void
  /** Keeps a registered row's disabled flag and handler current across renders. */
  update: (entry: MenuItemEntry) => void
  /** Index of the highlighted row, or -1. */
  activeId: number
  /** Highlight a row, e.g. when a pointer moves over it. */
  setActiveId: (id: number) => void
  /** A fresh registration id. */
  nextId: () => number
  /** Row order of a registered id, or -1. Registration order is render order. */
  indexOf: (id: number) => number
}

const MenuContext = createContext<MenuContextValue | null>(null)

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
 *
 * Keyboard: opening the menu puts focus on it and closing returns focus to the
 * trigger, both via FocusScope. Up/Down move the highlight and wrap, Home/End
 * jump to the ends, Enter/Space/gamepad-South choose, Escape closes. Disabled
 * items are stepped over rather than highlighted. FocusScope's focus trap
 * holds focus in the open menu from OneJS 3.4.8, the release where the bridge
 * began sending the `focusout` it listens for (Singtaa/OneJS#123); on earlier
 * OneJS it never fires.
 *
 * Rows are discovered by registration rather than by counting children, because
 * `children` is arbitrary: MenuSeparators are not rows, and a caller is free to
 * wrap items or render them from a map. Each MenuItem registers itself on
 * mount, so registration order is render order and a separator simply never
 * appears in the list.
 *
 * Known limitation: keyboard order is registration order, which is mount order.
 * An item mounted into the middle of an already-open menu therefore arrows last
 * while it draws in the middle. Static menus, and menus whose items all mount
 * together, are unaffected. Resolving it properly means asking UI Toolkit for
 * each row's sibling index, which is a bridge crossing per row that nothing in
 * this package can currently test; it is left undone rather than done blind.
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
  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v)
      if (open === undefined) setUncontrolled(v)
    },
    [onOpenChange, open]
  )

  // Registration order is the source of row order. Held in a ref because rows
  // register during layout effects, and re-rendering the menu on each one would
  // loop; `count` below is the only part the render needs.
  const itemsRef = useRef<MenuItemEntry[]>([])
  const idRef = useRef(0)
  const [count, setCount] = useState(0)

  const register = useCallback((entry: MenuItemEntry) => {
    itemsRef.current.push(entry)
    setCount(itemsRef.current.length)
    return () => {
      itemsRef.current = itemsRef.current.filter((e) => e.id !== entry.id)
      setCount(itemsRef.current.length)
    }
  }, [])

  const update = useCallback((entry: MenuItemEntry) => {
    const i = itemsRef.current.findIndex((e) => e.id === entry.id)
    if (i >= 0) itemsRef.current[i] = entry
  }, [])

  const isDisabled = useCallback((index: number) => !!itemsRef.current[index]?.disabled, [])

  const indexOf = useCallback((id: number) => itemsRef.current.findIndex((e) => e.id === id), [])

  const commit = useCallback(
    (index: number) => {
      const entry = itemsRef.current[index]
      if (!entry || entry.disabled) return
      entry.select(synthesizedClick())
      setOpen(false)
    },
    [setOpen]
  )

  const { activeIndex, setActiveIndex, menuProps } = useMenuNavigation({
    open: isOpen,
    count,
    isDisabled,
    onCommit: commit,
    onClose: () => setOpen(false),
  })

  const ctx = useMemo<MenuContextValue>(
    () => ({
      close: () => setOpen(false),
      register,
      update,
      activeId: activeIndex,
      setActiveId: setActiveIndex,
      nextId: () => idRef.current++,
      indexOf,
    }),
    [setOpen, register, update, activeIndex, setActiveIndex, indexOf]
  )

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
        <FocusScope>
          <View className={cx(styles.menu, RING_CLASS, className)} {...menuProps}>
            <MenuContext.Provider value={ctx}>{children}</MenuContext.Provider>
          </View>
        </FocusScope>
      </Overlay>
    </>
  )
}

export interface MenuItemProps {
  children?: ReactNode
  /**
   * Called when the item is chosen; the menu closes afterward. Receives the
   * click that chose it, so a choice made from the keyboard or a gamepad
   * arrives as a synthesised click with `pointerId: -1`.
   */
  onSelect?: (event: PointerEventData) => void
  disabled?: boolean
  /** Render as a destructive action (danger-colored text). */
  danger?: boolean
}

/** A selectable row inside a DropdownMenu. Closes the menu on select. */
export function MenuItem({ children, onSelect, disabled, danger }: MenuItemProps) {
  const ctx = useContext(MenuContext)

  // Stable for the life of the row, so re-renders update the registration in
  // place instead of reordering the menu.
  const idRef = useRef<number>(-1)
  if (idRef.current < 0) idRef.current = ctx ? ctx.nextId() : -1
  const id = idRef.current

  const select = useCallback(
    (event: PointerEventData) => {
      onSelect?.(event)
    },
    [onSelect]
  )

  // Registration order is render order, so this runs on mount only. The update
  // below keeps `disabled` and the handler current without re-registering.
  useLayoutEffect(() => {
    if (!ctx) return
    return ctx.register({ id, disabled: !!disabled, select })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    ctx?.update({ id, disabled: !!disabled, select })
  }, [ctx, id, disabled, select])

  // The menu drives rows by index, so a row resolves its own registration order
  // to know whether it is the highlighted one. `count` is recomputed on every
  // register/unregister, so this render already follows any reordering.
  const index = ctx ? ctx.indexOf(id) : -1
  const active = index >= 0 && index === ctx?.activeId

  return (
    <View
      className={cx(
        styles.item,
        danger && styles.itemDanger,
        disabled && styles.itemDisabled,
        active && styles.itemActive
      )}
      onPointerEnter={disabled || index < 0 ? undefined : () => ctx?.setActiveId(index)}
      onClick={
        disabled
          ? undefined
          : (e) => {
              select(e)
              ctx?.close()
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
