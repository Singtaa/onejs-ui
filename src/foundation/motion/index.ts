import motionStyles from "./motion.module.uss"

export { usePresence } from "./usePresence"
export type { Presence, PresenceStatus } from "./usePresence"

/**
 * Scoped class names for the shared motion presets (fade / scaleFade enter-exit
 * states and transition utilities). Use with `usePresence`.
 */
export const motion = motionStyles
