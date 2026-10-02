/**
 * Run with `npm test` (node's own runner, stripping types; no dependency).
 *
 * Which open overlay owns Escape and outside presses: the last one opened.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { pushLayer, removeLayer, isTopLayer } from "./layers.ts"

test("the overlay opened last is on top, and the one under it is not", () => {
    const dialog = {}, select = {}
    pushLayer(dialog)
    pushLayer(select)
    assert.equal(isTopLayer(select), true)
    assert.equal(isTopLayer(dialog), false)
    removeLayer(select)
    assert.equal(isTopLayer(dialog), true)
    removeLayer(dialog)
    assert.equal(isTopLayer(dialog), false)
})

test("closing an overlay that is not on top leaves the top one in place", () => {
    const a = {}, b = {}, c = {}
    pushLayer(a); pushLayer(b); pushLayer(c)
    removeLayer(b)
    assert.equal(isTopLayer(c), true)
    removeLayer(c)
    assert.equal(isTopLayer(a), true)
    removeLayer(a)
})
