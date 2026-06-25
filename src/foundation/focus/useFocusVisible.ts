import { useEffect, useState } from "react"
import { getModality, subscribeModality } from "./focusVisible"

/**
 * Reactive access to the current input modality. Useful for app-level hints
 * (e.g. showing "press Tab to navigate" only in keyboard modality). No built-in
 * component depends on it.
 */
export function useFocusVisible(): { modality: "pointer" | "keyboard" } {
  const [modality, setModality] = useState(getModality)
  useEffect(() => {
    const update = () => setModality(getModality())
    update()
    return subscribeModality(update)
  }, [])
  return { modality }
}
