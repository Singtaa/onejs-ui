/**
 * Run with `npm test` (node's own runner, stripping types; no dependency).
 *
 * The hooks are thin wrappers that hand React's state to these pure cores, so
 * the cores are where controlled versus uncontrolled is decided, and where the
 * deprecated `onClose` alias is folded into `onOpenChange`.
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { controllableState, openChangeHandler, openState } from "./controllable.ts"

/** A stand in for one `useState` slot: the value it holds and every write. */
function slot<T>(initial: T) {
    const s = { value: initial, writes: [] as T[], set: (v: T) => { s.value = v; s.writes.push(v) } }
    return s
}

test("uncontrolled: reads the component's own state, and a change writes it and tells the listener", () => {
    const own = slot("a")
    const heard: string[] = []
    const [value, setValue] = controllableState({ value: undefined, defaultValue: "a", onChange: (v) => heard.push(v) }, own.value, own.set)
    assert.equal(value, "a")
    setValue("b")
    assert.deepEqual(own.writes, ["b"])
    assert.deepEqual(heard, ["b"])
})

test("controlled: reads the prop, and a change only asks the owner", () => {
    const own = slot(false)
    const heard: boolean[] = []
    const [value, setValue] = controllableState({ value: true, defaultValue: false, onChange: (v) => heard.push(v) }, own.value, own.set)
    assert.equal(value, true)
    setValue(false)
    assert.deepEqual(own.writes, [])
    assert.deepEqual(heard, [false])
})

test("false is a controlled value, not a missing one", () => {
    const own = slot(true)
    const [value, setValue] = controllableState({ value: false, defaultValue: true }, own.value, own.set)
    assert.equal(value, false)
    setValue(true)
    assert.deepEqual(own.writes, [])
})

test("a change with no listener still updates an uncontrolled component", () => {
    const own = slot(0)
    const [, setValue] = controllableState({ value: undefined, defaultValue: 0 }, own.value, own.set)
    setValue(3)
    assert.equal(own.value, 3)
})

test("onOpenChange hears every change and the deprecated onClose hears only closing", () => {
    const calls: string[] = []
    const handler = openChangeHandler((open) => calls.push(`change:${open}`), () => calls.push("close"))
    handler!(true)
    handler!(false)
    assert.deepEqual(calls, ["change:true", "change:false", "close"])
})

test("onClose alone still fires on close, and nothing given means no handler", () => {
    let closed = 0
    openChangeHandler(undefined, () => closed++)!(false)
    assert.equal(closed, 1)
    assert.equal(openChangeHandler(undefined, undefined), undefined)
})

test("an uncontrolled overlay reads its own state and can always close itself", () => {
    const own = slot(true)
    const state = openState({}, own.value, own.set)
    assert.equal(state.open, true)
    assert.ok(state.close)
    state.close!()
    assert.deepEqual(own.writes, [false])
})

test("a controlled overlay closes through onClose as well as onOpenChange", () => {
    const own = slot(false)
    const calls: string[] = []
    const state = openState({ open: true, onClose: () => calls.push("close") }, own.value, own.set)
    assert.equal(state.open, true)
    state.close!()
    assert.deepEqual(calls, ["close"])
    assert.deepEqual(own.writes, [])
})

test("a controlled overlay nobody listens to offers no close, so it registers no dismissal", () => {
    const own = slot(false)
    const state = openState({ open: true }, own.value, own.set)
    assert.equal(state.close, undefined)
})
