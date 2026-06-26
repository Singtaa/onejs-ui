# onejs-ui

Themeable React component library for [OneJS v3](https://onejs.com) — built for **Unity UI Toolkit**, GPU-rendered, gamepad/keyboard-native. Not a web library ported over.

```tsx
import { ThemeProvider, Card, Heading, Button, darkTheme } from "onejs-ui"
```

## Highlights

- **~20 components** — layout, typography, form controls, and overlays.
- **Instant theming** — light/dark (or your own) via USS custom properties. A theme swap recompiles one small variables sheet; Unity re-resolves the cascade natively, with no React re-render.
- **Focus-visible keyboard/gamepad focus rings** — a real, themeable focus ring that follows navigation across every control and suppresses itself on pointer use (like the web's `:focus-visible`). This is wired up for you.
- **Native-backed form controls** — Checkbox/Switch/Slider/Input/Radio are built on the corresponding UI Toolkit controls, so they're genuine focus targets with full keyboard/IME behavior, restyled with theme tokens.
- **Portal-based overlays** — Popover, Dialog, DropdownMenu, Drawer, Toast, Tooltip on a shared positioning + dismissal + motion foundation.
- **Ships raw TS/TSX** — no build step; your app's esbuild bundles it (same model as `onejs-react`).

## Requirements

- **OneJS v3 runtime.** The focus ring's reliability depends on the runtime's tick-based `focuschange` signal. Use a OneJS build that includes it; with an older runtime the ring degrades gracefully to nav-event-driven only.
- **Peer dependencies:** `react` (18 or 19) and `onejs-react`.

## Install

```bash
npm install onejs-ui
```

## Quickstart

Wrap your app in `<ThemeProvider>` — that applies the theme **and** initializes the focus-visible manager. Everything inside gets themed components with working focus rings.

```tsx
import { useState } from "react"
import { render } from "onejs-react"
import {
    ThemeProvider, Card, Heading, Text, Button, Checkbox, HStack,
    useTheme, darkTheme, lightTheme,
} from "onejs-ui"

function App() {
    const { tokens, setTheme } = useTheme()
    const [agree, setAgree] = useState(false)
    return (
        <Card variant="raised" style={{ width: 360 }}>
            <Heading level={1}>onejs-ui</Heading>
            <Text tone="muted">Themed via USS variables.</Text>
            <Checkbox label="I agree" value={agree} onChange={setAgree} />
            <HStack gap={8}>
                <Button onClick={() => {}}>Primary</Button>
                <Button intent="secondary" onClick={() => setTheme(tokens === darkTheme ? lightTheme : darkTheme)}>
                    Toggle theme
                </Button>
            </HStack>
        </Card>
    )
}

render(
    <ThemeProvider theme={darkTheme}>
        <App />
    </ThemeProvider>,
    __root,
)
```

## Components

| Group | Components |
|-------|-----------|
| **Layout** | `Card`, `Stack` / `HStack` / `VStack`, `Divider`, `Spacer` |
| **Typography** | `Text`, `Heading` |
| **Form controls** | `Button`, `Checkbox`, `Switch`, `Input`, `Slider`, `RadioGroup`, `Select` |
| **Feedback** | `Badge`, `Toast` (`ToastProvider` + `useToast`) |
| **Overlays** | `Popover`, `Dialog`, `DropdownMenu` (+ `MenuItem`, `MenuSeparator`), `Drawer`, `Tooltip` |
| **Foundations** | `ThemeProvider`/`useTheme`, `FocusScope`/`FocusManager`, `Overlay`/`Scrim`, `usePresence`/`motion` |

Controlled inputs take `value` + `onChange(value)` (a plain value, not an event):

```tsx
<Switch label="Notifications" value={on} onChange={setOn} />
<Slider value={vol} lowValue={0} highValue={100} onChange={setVol} />
<Select value={fruit} options={FRUITS} onChange={setFruit} />
```

## Theming

A theme is a plain token object (`ThemeTokens`). `applyTheme(tokens)` emits it as `--ojs-*` USS custom properties on the render root; `<ThemeProvider>` wraps that and exposes `useTheme()` → `{ tokens, setTheme }`. Swapping themes is a single, cheap operation — Unity re-resolves `var()` against the new values with no React re-render.

```tsx
import { ThemeProvider, darkTheme, type ThemeTokens } from "onejs-ui"

// Custom theme: start from a default and override.
const brand: ThemeTokens = { ...darkTheme, primary: "#7c5cff", ring: "#cdb8ff" }

<ThemeProvider theme={brand}>…</ThemeProvider>
```

Components reference tokens only through `var(--ojs-*)` in their `.module.uss` files. (Inline `style=` can't read USS variables, so it's never used for themeable properties.)

Themes can also dress `Card` and `Button` in **9-slice frames** purely through optional decoration tokens (`cardImage` / `buttonImage` + slice insets), set typography globally via the optional `font` token, and be **referenced by name** once registered (`<ThemeProvider theme="dark">`, `setTheme("pixel")`). See the [theming guide](https://onejs.com/docs/onejs-ui/theming).

## Focus & navigation

`onejs-ui` ships a **focus-visible** model: the themeable ring shows only while the input modality is keyboard/gamepad and is suppressed on pointer use. `<ThemeProvider>` initializes it automatically, so all built-in controls get correct nav rings with **zero per-app wiring**.

For overlays and custom regions:

- `<FocusScope>` — autofocus, focus restoration, and an optional focus trap (used by `Dialog`/`Drawer`).
- `useFocusVisible()` — `{ modality: "pointer" | "keyboard" }`, for app-level hints.
- `FOCUS_RING_CLASS` — apply the ring to your own focusable Views via the `ring` primitive.

## Design principles

- **Game-engine first.** Built for UI Toolkit and gamepad/keyboard navigation. Web-only patterns (data grids, breadcrumbs, calendars, command palettes) are intentionally out of scope.
- **Class-driven theming.** Components style themselves through USS classes that read `--ojs-*` custom properties, so a theme swap is one variables-sheet recompile.
- **Flat, minimal aesthetics.** UI Toolkit has no `box-shadow`, so depth comes from surface-contrast layering and borders.
- **Cheap by construction.** Most components are pure-TSX composites over `onejs-react` primitives, styled by embedded CSS Modules. No custom C# required.

## License

MIT
