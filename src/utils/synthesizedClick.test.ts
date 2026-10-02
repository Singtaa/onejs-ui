/**
 * Run with `npm test`. A handler written for a pointer press must work on the
 * click a control synthesises for keyboard and gamepad activation.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { synthesizedClick } from "./synthesizedClick.ts"

test("a synthesised click supports the event methods a press handler calls", () => {
    const e = synthesizedClick()
    e.stopPropagation()
    e.preventDefault()
    assert.equal(e.propagationStopped, true)
    assert.equal(e.defaultPrevented, true)
    assert.equal(e.pointerId, -1)
})
