/**
 * Tiny className combiner. Filters out falsy values and joins with spaces, so
 * conditional classes read cleanly:
 *
 *   cx(styles.button, isActive && styles.active, className)
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  let out = ""
  for (const p of parts) {
    if (!p) continue
    out = out ? out + " " + p : p
  }
  return out
}
