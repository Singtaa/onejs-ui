import { getFocusedElement, isSameElement } from "./focusUtils"

declare const __root: any

/**
 * Class the manager toggles on the focused element when the input modality is
 * keyboard/gamepad. Named with a `focus` prefix on purpose: the CSS-module scoper
 * rewrites `ojs-*` classes but skips names starting with focus/hover/active/...,
 * so this survives verbatim and matches the `.focus-ring` selectors in component
 * `.module.uss` files.
 */
export const FOCUS_RING_CLASS = "focus-ring"

type Modality = "pointer" | "keyboard"

// Keys that signal keyboard/gamepad intent. Most arrow/Tab navigation arrives as
// NavigationMove events; this is the backstop for controls that consume the key
// without emitting one. (Unity KeyCode names, as dispatched by the bridge.)
const NAV_KEYS = new Set(["Tab", "UpArrow", "DownArrow", "LeftArrow", "RightArrow"])

let initialized = false
let modality: Modality = "keyboard"
let current: any = null
let rafPending = false
let syncRaf = 0
let initRaf = 0
const listeners: Array<() => void> = []
const subscribers = new Set<() => void>()

// Repaint the element and its subtree. The ring border can live on a CHILD of the
// focused element (Switch track, Checkbox checkmark, Slider thumb); marking only
// the focused element doesn't repaint those, and hovering or a theme swap can leave
// a class-driven border change stale.
function markRepaint(el: any, depth = 0) {
  if (!el || depth > 6) return
  try { el.MarkDirtyRepaint?.() } catch {}
  // Walk the VISUAL hierarchy: the ring sub-parts (checkmark, dragger, track) live
  // there, not in the logical contentContainer that `childCount`/`el[i]` resolve to.
  try {
    const h = el.hierarchy
    const n = h?.childCount ?? 0
    for (let i = 0; i < n; i++) {
      let c: any = null
      try { c = h.ElementAt(i) } catch {}
      if (c) markRepaint(c, depth + 1)
    }
  } catch {}
}

function addRing(el: any) {
  try { el?.AddToClassList?.(FOCUS_RING_CLASS) } catch {}
  markRepaint(el)
}
function removeRing(el: any) {
  try { el?.RemoveFromClassList?.(FOCUS_RING_CLASS) } catch {}
  markRepaint(el)
}

function clearRing() {
  if (current) {
    removeRing(current)
    current = null
  }
}

// Collect a composite control's `.unity-radio-button` descendants (visual hierarchy).
function collectRadios(el: any, out: any[], depth: number) {
  if (!el || depth > 4 || out.length > 64) return
  try {
    const h = el.hierarchy
    const n = h?.childCount ?? 0
    for (let i = 0; i < n; i++) {
      let c: any = null
      try { c = h.ElementAt(i) } catch {}
      if (!c) continue
      let isRadio = false
      try { isRadio = !!c.ClassListContains?.("unity-radio-button") } catch {}
      if (isRadio) out.push(c)
      else collectRadios(c, out, depth + 1)
    }
  } catch {}
}

// A RadioButtonGroup delegates focus to its radios but, on keyboard ENTRY, settles the
// focus *leaf* on the group itself (Unity's historical "extra step"), so no radio gets
// native `:focus` and the landing radio shows no ring. Promote the target radio to a
// real focus leaf via Focus(): this routes through the genuine FocusController path, so
// the radio gets native `:focus` (the `.radioGroup.focus-ring .unity-radio-button:focus`
// rule then lights up, since the manager already rings the GROUP) and it self-clears on
// exit — no stuck class. Focus() does NOT toggle `value`, so selection is unchanged, and
// focusedElement keeps reporting the GROUP, so this doesn't re-trigger syncRingToFocused.
function promoteRadioGroupEntry(el: any) {
  let isGroup = false
  try { isGroup = !!el?.ClassListContains?.("unity-radio-button-group") } catch {}
  if (!isGroup) return
  const radios: any[] = []
  collectRadios(el, radios, 0)
  if (radios.length === 0) return
  let idx = 0 // prefer the checked radio (mirrors Unity), else the first
  try {
    const v = el.value
    if (typeof v === "number" && v >= 0 && v < radios.length) idx = v
  } catch {}
  try { radios[idx]?.Focus?.() } catch {}
}

/**
 * Point the ring at whatever the panel reports as focused, when modality is
 * keyboard. Reads the live `focusController.focusedElement`, so it works even if
 * focus *events* never arrived (the nav-driven backbone).
 */
function syncRingToFocused() {
  if (!initialized) return // a deferred sync may fire after disposeFocusVisible()
  if (modality !== "keyboard") {
    clearRing()
    return
  }
  const el = getFocusedElement()
  if (!el) {
    clearRing()
    return
  }
  if (current && isSameElement(current, el)) return
  if (current) removeRing(current)
  addRing(el)
  current = el
  // Runs only on a FRESH focus (the isSameElement guard above returns early on re-sync
  // of the same element), so a RadioButtonGroup's entry radio is promoted exactly once.
  promoteRadioGroupEntry(el)
}

// Focus moves *after* the nav event, so read it on the next frame.
function deferSync() {
  if (rafPending) return
  rafPending = true
  syncRaf = requestAnimationFrame(() => {
    rafPending = false
    syncRaf = 0
    syncRingToFocused()
  })
}

// Ring the initially-focused control (e.g. the panel's auto-focus on Play start),
// retrying a few frames since autofocus can land after init. Stops once something
// is ringed or the user switches to pointer.
function initialSync(attempts: number) {
  initRaf = 0
  if (!initialized || modality === "pointer" || current) return
  syncRingToFocused()
  if (!current && attempts > 0) {
    initRaf = requestAnimationFrame(() => initialSync(attempts - 1))
  }
}

function notify() {
  for (const cb of subscribers) {
    try { cb() } catch {}
  }
}

function setModality(next: Modality) {
  if (modality === next) return
  modality = next
  notify()
  if (next === "pointer") clearRing()
  else syncRingToFocused()
}

/**
 * Initialize the global focus-visible manager (idempotent). Wires modality +
 * focus tracking on `__root` and toggles `FOCUS_RING_CLASS` imperatively on the
 * focused element — never via React state, which would re-render and blur it.
 * Called automatically by `ThemeProvider`; also exposed for manual setups.
 */
export function initFocusVisible(): void {
  if (initialized) return
  if (typeof __root === "undefined" || typeof __eventAPI === "undefined") return
  initialized = true

  const on = (type: string, handler: (e: any) => void) => {
    __eventAPI.addEventListener(__root, type, handler)
    listeners.push(() => {
      try { __eventAPI.removeEventListener(__root, type, handler) } catch {}
    })
  }

  on("pointerdown", () => setModality("pointer"))
  on("navigationmove", () => { setModality("keyboard"); deferSync() })
  on("navigationsubmit", () => { setModality("keyboard"); deferSync() })
  on("keydown", (e: any) => {
    if (e && NAV_KEYS.has(e.key)) { setModality("keyboard"); deferSync() }
  })
  // The bridge dispatches focus as "focus"/"blur", which are non-bubbling, so a
  // global focus listener on __root can't see descendant focus. The ring is driven
  // by nav events (which DO bubble) + the C# `focuschange` signal (a tick-based
  // detector that reads focusController.focusedElement and captures programmatic
  // focus the event path drops).
  on("focuschange", () => deferSync())

  // Ring the initially-focused control at startup (autofocus may land after init).
  initialSync(60)
}

/** Tear down the manager (listeners + ring). Mainly for hot reload symmetry. */
export function disposeFocusVisible(): void {
  if (!initialized) return
  clearRing()
  for (const off of listeners) off()
  listeners.length = 0
  if (syncRaf) { try { cancelAnimationFrame(syncRaf) } catch {} syncRaf = 0 }
  if (initRaf) { try { cancelAnimationFrame(initRaf) } catch {} initRaf = 0 }
  rafPending = false
  modality = "keyboard" // reset to default so a later re-init starts clean
  initialized = false
}

/** Current input modality. */
export function getModality(): Modality {
  return modality
}

/** Subscribe to modality changes; returns an unsubscribe fn. */
export function subscribeModality(cb: () => void): () => void {
  subscribers.add(cb)
  return () => { subscribers.delete(cb) }
}
