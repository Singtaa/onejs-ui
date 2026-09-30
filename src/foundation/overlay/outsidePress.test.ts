/**
 * Run with `npm test` (node's own runner, stripping types; no dependency).
 *
 * Whether a press dismisses an overlay. Once presses on app content bubble to
 * __root, the press on an open overlay's own trigger arrives there too: if it
 * counted as outside, it would close the overlay and the trigger's click would
 * open it again.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { isOutsidePress } from "./outsidePress.ts"

const panel = { x: 100, y: 100, width: 200, height: 150 }
const trigger = { x: 100, y: 60, width: 80, height: 30 }

test("a press inside the panel is not outside", () => {
    assert.equal(isOutsidePress(150, 150, [panel, trigger]), false)
})

test("a press on the trigger is not outside, so the trigger alone toggles", () => {
    assert.equal(isOutsidePress(120, 70, [panel, trigger]), false)
})

test("a press anywhere else is outside", () => {
    assert.equal(isOutsidePress(20, 20, [panel, trigger]), true)
})

test("an element not laid out yet contains nothing", () => {
    assert.equal(isOutsidePress(150, 150, [null, undefined]), true)
})
