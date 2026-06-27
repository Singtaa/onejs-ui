import { useEffect, useRef } from "react"
import { registerElement, createComponent } from "onejs-react"
import { cx } from "../../utils/cx"
import { FOCUS_RING_CLASS, getModality, subscribeModality } from "../../foundation/focus/focusVisible"
import styles from "./RadioGroup.module.uss"

declare const CS: any
declare const __eventAPI: any

// RadioButtonGroup isn't wired in onejs-react's reconciler, so register it once.
// It auto-creates a RadioButton per `choices` entry; `value` is the selected index.
registerElement("radio-button-group", CS.UnityEngine.UIElements.RadioButtonGroup)
const NativeRadioGroup = createComponent("radio-button-group")

export interface RadioGroupProps {
  /** Selected index, or -1 for none. */
  value?: number
  /** The option labels. */
  choices?: string[]
  /** Called with the newly selected index. */
  onChange?: (value: number) => void
  disabled?: boolean
  className?: string
}

// The group's RadioButtons live in its visual hierarchy (not its logical
// contentContainer), so collect them by walking `hierarchy`.
function collectRadios(group: any): any[] {
  const out: any[] = []
  const stack: any[] = [group]
  let guard = 0
  while (stack.length > 0 && guard++ < 500) {
    const el = stack.shift()
    try {
      if (el !== group && el?.ClassListContains?.("unity-radio-button")) {
        out.push(el)
        continue // radios aren't nested
      }
    } catch {
      // ignore destroyed proxies
    }
    try {
      const h = el?.hierarchy
      const n = h?.childCount ?? 0
      for (let i = 0; i < n; i++) {
        try { const c = h.ElementAt(i); if (c) stack.push(c) } catch {}
      }
    } catch {
      // no hierarchy
    }
  }
  return out
}

/**
 * Radio group on the native UI Toolkit RadioButtonGroup (a proper focus target),
 * restyled with theme tokens. Controlled via `value` (index) + `onChange`.
 */
export function RadioGroup({ onChange, className, choices, ...rest }: RadioGroupProps) {
  const groupRef = useRef<any>(null)

  // The group's onChange also receives the individual RadioButtons' bool change
  // events (they bubble up). Only the group's own int change is the selection.
  const handleChange = onChange
    ? (e: any) => {
        if (typeof e?.value === "number") onChange(e.value)
      }
    : undefined

  // Keyboard focus ring for the radios. The RadioButtonGroup is a single focus stop
  // — focus never lands on an individual radio, and the group marks a radio's
  // `:focus` pseudo-state only once you arrow, so the radio you first land on isn't
  // ringed by the USS `:focus` rule. But each RadioButton fires a FocusInEvent
  // ("focus") when navigated to, including on entry, so we ring it from that event.
  // Gated to keyboard modality (focus-visible); cleared on blur / when pointer takes
  // over.
  const choicesKey = (choices ?? []).join("")
  useEffect(() => {
    const group = groupRef.current
    if (!group || typeof __eventAPI === "undefined") return

    type Binding = { el: any; onF: () => void; onB: () => void }
    const bound: Binding[] = []
    let raf = 0

    const ring = (el: any, on: boolean) => {
      try {
        if (on) el.AddToClassList(FOCUS_RING_CLASS)
        else el.RemoveFromClassList(FOCUS_RING_CLASS)
        el.MarkDirtyRepaint?.()
      } catch {
        // element gone
      }
    }
    const clearAll = () => { for (const b of bound) ring(b.el, false) }

    // Radios are created asynchronously by the native group from `choices`; retry a
    // few frames until they exist, then bind focus/blur on each.
    const attach = (attempts: number) => {
      const radios = collectRadios(group)
      if (radios.length === 0) {
        if (attempts > 0) raf = requestAnimationFrame(() => attach(attempts - 1))
        return
      }
      for (const el of radios) {
        const onF = () => { if (getModality() === "keyboard") ring(el, true) }
        const onB = () => ring(el, false)
        try {
          __eventAPI.addEventListener(el, "focus", onF)
          __eventAPI.addEventListener(el, "blur", onB)
          bound.push({ el, onF, onB })
        } catch {
          // ignore
        }
      }
    }
    attach(12)

    // Switching to pointer modality suppresses focus rings; a click on the already
    // focused radio won't blur it, so clear explicitly when modality leaves keyboard.
    const unsub = subscribeModality(() => {
      if (getModality() !== "keyboard") clearAll()
    })

    return () => {
      cancelAnimationFrame(raf)
      unsub()
      for (const b of bound) {
        try {
          __eventAPI.removeEventListener(b.el, "focus", b.onF)
          __eventAPI.removeEventListener(b.el, "blur", b.onB)
          b.el.RemoveFromClassList(FOCUS_RING_CLASS)
        } catch {
          // ignore
        }
      }
    }
  }, [choicesKey])

  return (
    <NativeRadioGroup
      ref={groupRef}
      className={cx(styles.radioGroup, className)}
      onChange={handleChange}
      choices={choices}
      {...(rest as any)}
    />
  )
}
