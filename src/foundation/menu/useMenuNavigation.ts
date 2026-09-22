import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { KeyEventData, NavigationEventData } from "onejs-react"
import { resolveMenuKey, resolveMenuNavigation, type MenuKeyAction, type MenuKeyState } from "./menuKeys"

export interface MenuNavigationOptions {
    /** Whether the menu is open. Closing resets the highlight. */
    open: boolean
    /** Number of rows. */
    count: number
    /** Rows that cannot be highlighted or chosen. */
    isDisabled?: (index: number) => boolean
    /** Called with the row the user chose. The caller closes the menu. */
    onCommit: (index: number) => void
    /** Called when the menu asks to close without choosing. */
    onClose?: () => void
    /** Row to highlight when the menu opens. Default -1, nothing highlighted. */
    initialIndex?: number
}

export interface MenuNavigation {
    /** Highlighted row, or -1. */
    activeIndex: number
    /** Highlight a row, e.g. from a pointer moving over it. */
    setActiveIndex: (index: number) => void
    /** Spread onto the menu container. */
    menuProps: {
        focusable: true
        onKeyDown: (e: KeyEventData) => void
        onNavigationMove: (e: NavigationEventData) => void
        onNavigationSubmit: (e: NavigationEventData) => void
    }
}

/**
 * Arrow/Home/End/Enter handling for an open menu, on top of the pure key map in
 * menuKeys.
 *
 * The container is the focus target, not the rows. Rows stay unfocusable Views,
 * so the highlight is a class this hook owns rather than real focus, and
 * UI Toolkit is never asked to move focus between rows. That is deliberate:
 * NavigationMoveEvent's default is to move focus, and the bridge does not mirror
 * `preventDefault()` onto navigation events the way it does for pointer and
 * wheel events (QuickJSUIBridge.OnNavigationMove does not call
 * ApplyNativeSuppression), so JS cannot currently stop that default. Making the
 * rows focusable would mean competing with a focus move that cannot be
 * cancelled. Keeping one focus target inside a FocusScope means the trap has
 * somewhere to put focus back, and the arithmetic stays entirely ours.
 *
 * Escape is reported through `onClose`, but the Overlay foundation also
 * dismisses on Escape globally, so a caller inside an Overlay can leave
 * `onClose` off and let that handle it.
 */
export function useMenuNavigation({
    open,
    count,
    isDisabled,
    onCommit,
    onClose,
    initialIndex = -1,
}: MenuNavigationOptions): MenuNavigation {
    const [activeIndex, setActiveIndex] = useState(initialIndex)

    // Reopening starts from the caller's initial row rather than wherever the
    // last visit finished.
    useEffect(() => {
        if (open) setActiveIndex(initialIndex)
    }, [open, initialIndex])

    // One Enter press can arrive as both a KeyDown and a NavigationSubmit, which
    // would choose a row and then choose whatever the closing menu left behind.
    // Same guard, and same reason, as Button's.
    const committingRef = useRef(false)

    // Every input these handlers read changes on some render, so closing over
    // them would rebuild all three handlers every time the highlight moved, and
    // the reconciler would re-register three native callbacks per arrow press.
    // Reading them from a ref that a layout effect refreshes keeps the handlers
    // stable for the life of the menu; an event cannot arrive before the commit
    // that updated the ref, so what they read is never stale.
    const latest = useRef({ activeIndex, count, isDisabled, onCommit, onClose })
    useLayoutEffect(() => {
        latest.current = { activeIndex, count, isDisabled, onCommit, onClose }
    })

    const apply = useCallback((action: MenuKeyAction) => {
        switch (action.kind) {
            case "move":
                setActiveIndex(action.index)
                return
            case "commit": {
                if (committingRef.current) return
                committingRef.current = true
                requestAnimationFrame(() => {
                    committingRef.current = false
                })
                latest.current.onCommit(action.index)
                return
            }
            case "close":
                latest.current.onClose?.()
                return
            default:
                return
        }
    }, [])

    const stateNow = useCallback((): MenuKeyState => {
        const { activeIndex: a, count: c, isDisabled: d } = latest.current
        return { activeIndex: a, count: c, isDisabled: d }
    }, [])

    const onKeyDown = useCallback(
        (e: KeyEventData) => apply(resolveMenuKey(e.key, stateNow())),
        [apply, stateNow]
    )

    const onNavigationMove = useCallback(
        (e: NavigationEventData) => apply(resolveMenuNavigation(e.direction, stateNow())),
        [apply, stateNow]
    )

    const onNavigationSubmit = useCallback(() => {
        // Gamepad South. Routed through the same commit path as Return so the
        // guard above covers both.
        apply(resolveMenuKey("Return", stateNow()))
    }, [apply, stateNow])

    const menuProps = useMemo(
        () => ({ focusable: true as const, onKeyDown, onNavigationMove, onNavigationSubmit }),
        [onKeyDown, onNavigationMove, onNavigationSubmit]
    )

    return { activeIndex, setActiveIndex, menuProps }
}
