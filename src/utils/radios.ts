/**
 * The `.unity-radio-button` descendants of a native radio control, in visual
 * hierarchy order, which is the order a RadioButtonGroup's `value` indexes.
 * Walks `hierarchy` rather than `contentContainer`, because the radios a group
 * builds from `choices` live inside its internal input element.
 */
export function findRadioButtons(el: any): any[] {
  const out: any[] = []
  collect(el, out, 0)
  return out
}

function collect(el: any, out: any[], depth: number) {
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
      else collect(c, out, depth + 1)
    }
  } catch {}
}
