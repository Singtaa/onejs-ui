/**
 * Run with `npm test`. RadioGroup speaks option values while the native
 * RadioButtonGroup underneath speaks labels and indices; this is the
 * translation between the two.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { optionIndex, optionLabels, optionValueAt } from "./radioOptions.ts"

const SIZES = [
    { value: "s", label: "Small" },
    { value: "m", label: "Medium", disabled: true },
    { value: "l", label: "Large" },
]

test("labels are what the native group draws, in option order", () => {
    assert.deepEqual(optionLabels(SIZES), ["Small", "Medium", "Large"])
})

test("a value selects its option's index, and an unknown or missing value selects none", () => {
    assert.equal(optionIndex(SIZES, "l"), 2)
    assert.equal(optionIndex(SIZES, "xl"), -1)
    assert.equal(optionIndex(SIZES, undefined), -1)
})

test("an index the native group reports reads back as that option's value", () => {
    assert.equal(optionValueAt(SIZES, 0), "s")
    assert.equal(optionValueAt(SIZES, 2), "l")
})

test("a disabled option or an index outside the list yields no value", () => {
    assert.equal(optionValueAt(SIZES, 1), undefined)
    assert.equal(optionValueAt(SIZES, -1), undefined)
    assert.equal(optionValueAt(SIZES, 3), undefined)
})
