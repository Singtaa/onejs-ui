// Side-effect import compiles the `ring` primitive's stylesheet into the panel and
// exposes its scoped class. Add RING_CLASS to a focusable View and the focus-visible
// manager paints the ring on keyboard focus (the `.ring`/`.ring.focus-ring` rules).
import ringStyles from "./focus.module.uss"
/** Scoped class for the reusable focus-ring primitive (see focus.module.uss). */
export const RING_CLASS: string = ringStyles.ring

export { FocusScope } from "./FocusScope"
export type { FocusScopeProps } from "./FocusScope"
export { useFocusReturn } from "./useFocusReturn"
export { FocusManager } from "./FocusManager"
export type { FocusManagerProps } from "./FocusManager"
export { useFocusVisible } from "./useFocusVisible"
export { initFocusVisible, disposeFocusVisible, FOCUS_RING_CLASS } from "./focusVisible"
export {
  getFocusedElement,
  focusElement,
  focusFirstIn,
  findFirstFocusable,
  isSameElement,
  isWithin,
} from "./focusUtils"
