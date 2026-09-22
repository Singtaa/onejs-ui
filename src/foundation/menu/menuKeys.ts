/**
 * Which menu row a key press should land on, as a pure function.
 *
 * The interesting part of in-menu navigation is not reading the key, it is the
 * arithmetic: wrapping past both ends, stepping over disabled rows, deciding
 * where "down" goes when nothing is highlighted yet, and terminating when every
 * row is disabled. That is all decidable from three numbers and a predicate, so
 * it lives here with no React and no Unity anywhere near it, which is what lets
 * `npm test` cover it on a laptop with no editor open.
 *
 * `key` values are Unity `KeyCode` names, because that is what arrives: the
 * bridge serialises `keyCode.ToString()` into `KeyEventData.key`, so Enter is
 * "Return", not "Enter". See QuickJSUIBridge.DispatchKeyEvent.
 */

/** What the caller should do in response to a key. */
export type MenuKeyAction =
    | { kind: "none" }
    /** Highlight `index`. */
    | { kind: "move"; index: number }
    /** Choose `index` and close. */
    | { kind: "commit"; index: number }
    /** Close without choosing. */
    | { kind: "close" }

export interface MenuKeyState {
    /** Currently highlighted row, or -1 when nothing is highlighted. */
    activeIndex: number
    /** Number of rows. */
    count: number
    /** Rows that cannot be highlighted or chosen. Defaults to none disabled. */
    isDisabled?: (index: number) => boolean
}

const NONE: MenuKeyAction = { kind: "none" }

const disabledAt = (state: MenuKeyState, index: number): boolean =>
    state.isDisabled ? state.isDisabled(index) : false

/**
 * The next enabled row `delta` away from `from`, wrapping.
 *
 * Bounded by `count` attempts rather than looping until it finds one, so a menu
 * whose rows are all disabled returns where it started instead of spinning.
 */
function step(state: MenuKeyState, from: number, delta: number): number {
    const { count } = state
    if (count <= 0) return -1
    // From nothing, "down" should land on the first row and "up" on the last.
    // Starting "up" at 0 rather than -1 makes one step of -1 wrap to count - 1.
    let index = from < 0 ? (delta > 0 ? -1 : 0) : from
    for (let i = 0; i < count; i++) {
        index = (index + delta + count) % count
        if (!disabledAt(state, index)) return index
    }
    return from
}

/** The first enabled row from one end, or -1 when every row is disabled. */
function edge(state: MenuKeyState, fromEnd: boolean): number {
    const { count } = state
    for (let i = 0; i < count; i++) {
        const index = fromEnd ? count - 1 - i : i
        if (!disabledAt(state, index)) return index
    }
    return -1
}

const moveTo = (index: number, from: number): MenuKeyAction =>
    index < 0 || index === from ? NONE : { kind: "move", index }

/**
 * Resolve a key press against the menu's current state.
 *
 * Escape resolves to `close` even though the Overlay foundation also dismisses
 * on Escape globally. Reporting it here keeps this function a complete account
 * of the key map, which is what the tests read; a caller that already has
 * global dismissal can ignore the action.
 */
export function resolveMenuKey(key: string, state: MenuKeyState): MenuKeyAction {
    const { activeIndex, count } = state
    switch (key) {
        case "DownArrow":
            return moveTo(step(state, activeIndex, 1), activeIndex)
        case "UpArrow":
            return moveTo(step(state, activeIndex, -1), activeIndex)
        case "Home":
            return moveTo(edge(state, false), activeIndex)
        case "End":
            return moveTo(edge(state, true), activeIndex)
        case "Return":
        case "KeypadEnter":
        case "Space":
            // Nothing highlighted, or a highlight left pointing at a row that has
            // since been disabled: there is nothing to commit, so swallow it
            // rather than choosing a row the user cannot see highlighted.
            if (activeIndex < 0 || activeIndex >= count || disabledAt(state, activeIndex)) return NONE
            return { kind: "commit", index: activeIndex }
        case "Escape":
            return { kind: "close" }
        default:
            return NONE
    }
}

/**
 * The same map for gamepad and spatial navigation, which arrives as
 * `NavigationMoveEvent` with a direction rather than as a key. Left and right
 * are deliberately unhandled: a single-column menu has nowhere to send them,
 * and swallowing them would stop a parent acting on them.
 */
export function resolveMenuNavigation(direction: string | undefined, state: MenuKeyState): MenuKeyAction {
    if (direction === "up") return resolveMenuKey("UpArrow", state)
    if (direction === "down") return resolveMenuKey("DownArrow", state)
    return NONE
}
