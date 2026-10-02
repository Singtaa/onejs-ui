import type { View, Text, Button, TextField, Toggle, Slider } from "onejs-react"

interface Primitives {
  View: typeof View
  Text: typeof Text
  Button: typeof Button
  TextField: typeof TextField
  Toggle: typeof Toggle
  Slider: typeof Slider
}

/**
 * The `ref` a onejs-react primitive accepts, read off the primitive itself so
 * it always uses the React types the primitive was declared with.
 */
export type ElementRef<K extends keyof Primitives> = Parameters<Primitives[K]>[0]["ref"]
