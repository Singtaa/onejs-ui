/**
 * Run with `npm test`. Badge, Toast and MenuItem share one `intent`
 * vocabulary; the names they used before still arrive at the same place.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { menuItemIntent, toastIntent } from "./intent.ts"

test("a toast's intent wins, and with none it is neutral", () => {
    assert.equal(toastIntent("primary", "danger"), "primary")
    assert.equal(toastIntent(undefined, undefined), "neutral")
})

test("the deprecated tone maps onto intent, its default becoming neutral", () => {
    assert.equal(toastIntent(undefined, "default"), "neutral")
    assert.equal(toastIntent(undefined, "success"), "success")
    assert.equal(toastIntent(undefined, "warning"), "warning")
    assert.equal(toastIntent(undefined, "danger"), "danger")
    assert.equal(toastIntent(undefined, "info"), "info")
})

test("a menu item's intent wins over the deprecated danger flag", () => {
    assert.equal(menuItemIntent("danger", undefined), "danger")
    assert.equal(menuItemIntent("neutral", true), "neutral")
    assert.equal(menuItemIntent(undefined, true), "danger")
    assert.equal(menuItemIntent(undefined, false), "neutral")
    assert.equal(menuItemIntent(undefined, undefined), "neutral")
})
