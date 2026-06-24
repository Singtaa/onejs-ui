import { useEffect, useState } from "react"

export type PresenceStatus = "open" | "closed"

export interface Presence {
  /** Whether to render the element. Stays true through the exit transition. */
  mounted: boolean
  /** Drives the open/closed transition classes (e.g. motion.fadeOpen / fadeClosed). */
  status: PresenceStatus
}

/**
 * Keeps an element mounted through its exit transition so enter and exit both
 * animate. Render while `mounted`, and apply open/closed classes from `status`.
 *
 * UI Toolkit has USS transitions but no keyframes, so animation is a transition
 * between a closed state (e.g. opacity 0) and an open state, toggled by class.
 *
 * @param open       Desired visibility.
 * @param durationMs Time to keep mounted after closing; match the USS transition
 *                   duration (default 160ms, matching --ojs-motion-base).
 *
 * @example
 * const { mounted, status } = usePresence(open)
 * if (!mounted) return null
 * return <View className={cx(motion.fade, status === "open" ? motion.fadeOpen : motion.fadeClosed)} />
 */
export function usePresence(open: boolean, durationMs = 160): Presence {
  const [mounted, setMounted] = useState(open)
  const [status, setStatus] = useState<PresenceStatus>("closed")

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Double rAF so the element actually paints in the closed state before
      // flipping to open; a single frame can be coalesced into one paint (no
      // animation), which matters for transforms like a drawer's slide.
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setStatus("open"))
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    }
    setStatus("closed")
    const t = setTimeout(() => setMounted(false), durationMs)
    return () => clearTimeout(t)
  }, [open, durationMs])

  return { mounted, status }
}
