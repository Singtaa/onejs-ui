/**
 * Run with `npm test` (node's own runner, stripping types; no dependency).
 *
 * These cover the arithmetic that in-menu navigation actually gets wrong:
 * wrapping at both ends, stepping over disabled rows, where the first press
 * goes when nothing is highlighted, and the all-disabled menu that a naive
 * "keep looking" loop hangs on.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { resolveMenuKey, resolveMenuNavigation, type MenuKeyState } from "./menuKeys.ts"

const menu = (activeIndex: number, count = 3, disabled: number[] = []): MenuKeyState => ({
    activeIndex,
    count,
    isDisabled: (i) => disabled.includes(i),
})

test("down from nothing highlights the first row, up highlights the last", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(-1)), { kind: "move", index: 0 })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(-1)), { kind: "move", index: 2 })
})

test("arrows step one row at a time", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(0)), { kind: "move", index: 1 })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(2)), { kind: "move", index: 1 })
})

test("arrows wrap at both ends", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(2)), { kind: "move", index: 0 })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(0)), { kind: "move", index: 2 })
})

test("Home and End go to the outermost rows", () => {
    assert.deepEqual(resolveMenuKey("Home", menu(2)), { kind: "move", index: 0 })
    assert.deepEqual(resolveMenuKey("End", menu(0)), { kind: "move", index: 2 })
})

test("Home and End skip past disabled rows at the edges", () => {
    assert.deepEqual(resolveMenuKey("Home", menu(3, 4, [0])), { kind: "move", index: 1 })
    assert.deepEqual(resolveMenuKey("End", menu(0, 4, [3])), { kind: "move", index: 2 })
})

test("arrows step over a disabled row rather than landing on it", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(0, 3, [1])), { kind: "move", index: 2 })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(2, 3, [1])), { kind: "move", index: 0 })
})

test("arrows wrap over a disabled row at the end", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(1, 3, [2])), { kind: "move", index: 0 })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(1, 3, [0])), { kind: "move", index: 2 })
})

test("a menu whose rows are all disabled terminates and moves nowhere", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(-1, 3, [0, 1, 2])), { kind: "none" })
    assert.deepEqual(resolveMenuKey("UpArrow", menu(1, 3, [0, 1, 2])), { kind: "none" })
    assert.deepEqual(resolveMenuKey("Home", menu(-1, 3, [0, 1, 2])), { kind: "none" })
})

test("an empty menu moves nowhere", () => {
    assert.deepEqual(resolveMenuKey("DownArrow", menu(-1, 0)), { kind: "none" })
    assert.deepEqual(resolveMenuKey("End", menu(-1, 0)), { kind: "none" })
})

test("the only enabled row is not re-announced as a move", () => {
    // Stepping from the single enabled row wraps back onto itself. Reporting a
    // move to where the highlight already is would restart its transition.
    assert.deepEqual(resolveMenuKey("DownArrow", menu(1, 3, [0, 2])), { kind: "none" })
})

test("Enter, keypad Enter and Space commit the highlighted row", () => {
    for (const key of ["Return", "KeypadEnter", "Space"]) {
        assert.deepEqual(resolveMenuKey(key, menu(1)), { kind: "commit", index: 1 })
    }
})

test("commit is swallowed when nothing is highlighted", () => {
    assert.deepEqual(resolveMenuKey("Return", menu(-1)), { kind: "none" })
})

test("commit is swallowed when the highlighted row went disabled under it", () => {
    assert.deepEqual(resolveMenuKey("Return", menu(1, 3, [1])), { kind: "none" })
})

test("commit is swallowed when the highlight is past the end of a shrunken menu", () => {
    assert.deepEqual(resolveMenuKey("Return", menu(5, 3)), { kind: "none" })
})

test("Escape closes", () => {
    assert.deepEqual(resolveMenuKey("Escape", menu(1)), { kind: "close" })
})

test("keys the menu does not claim are left alone", () => {
    for (const key of ["Tab", "A", "LeftArrow", "RightArrow", "PageDown"]) {
        assert.deepEqual(resolveMenuKey(key, menu(1)), { kind: "none" })
    }
})

test("gamepad up and down mirror the arrow keys", () => {
    assert.deepEqual(resolveMenuNavigation("down", menu(2)), { kind: "move", index: 0 })
    assert.deepEqual(resolveMenuNavigation("up", menu(0)), { kind: "move", index: 2 })
})

test("gamepad left, right and the rest are left for a parent to handle", () => {
    for (const direction of ["left", "right", "next", "previous", "none", undefined]) {
        assert.deepEqual(resolveMenuNavigation(direction, menu(1)), { kind: "none" })
    }
})
