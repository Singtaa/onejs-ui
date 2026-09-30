# onejs-ui

Themeable React component library for [OneJS v3](https://onejs.com). Built for **Unity UI Toolkit**, GPU-rendered and gamepad/keyboard-native. Not a web library ported over.

```tsx
import { ThemeProvider, Card, Heading, Button, darkTheme } from "onejs-ui"
```

## Highlights

- **~20 components**: layout, typography, form controls, and overlays.
- **Instant theming**: light/dark (or your own) via USS custom properties. A theme swap recompiles one small variables sheet; Unity re-resolves the cascade natively, with no React re-render.
- **Focus-visible keyboard/gamepad focus rings**: a real, themeable focus ring that follows navigation and suppresses itself on pointer use (like the web's `:focus-visible`). This is wired up for you.
- **Native-backed form controls**: Checkbox/Switch/Slider/Input/Radio are built on the corresponding UI Toolkit controls, so they're genuine focus targets with full keyboard/IME behavior, restyled with theme tokens.
- **Portal-based overlays**: Popover, Dialog, DropdownMenu, Drawer, Toast, Tooltip on a shared positioning + dismissal + motion foundation.
- **Ships raw TS/TSX**: no build step; your app's esbuild bundles it (same model as `onejs-react`).

## Requirements

- **OneJS v3 runtime.** The focus ring's reliability depends on the runtime's tick-based `focuschange` signal. Use a OneJS build that includes it; with an older runtime the ring degrades gracefully to nav-event-driven only.
- **OneJS 3.4.8 or newer for focus traps.** `FocusScope`'s trap (used by `Dialog`, `Drawer`, `Select` and `DropdownMenu`) listens for `focusout`, which the bridge sends from 3.4.8. Menu arrow keys work on older runtimes too: the menu keeps focus on its container and never needs `preventDefault` on navigation events.
- **Peer dependencies:** `react` (18 or 19) and `onejs-react` 0.2.2 or newer.
- **onejs-react 0.2.2 or newer, with onejs-ui 0.0.5 or newer.** Overlays close on an outside press or Escape, and the focus ring tells pointer from keyboard, through listeners on `__root`, which hear bubbled events only from onejs-react 0.2.2. On an older onejs-react, an outside press does not close a Popover, menu or Select, Escape does not close a Popover, Dialog or Drawer, and the focus ring does not switch between pointer and keyboard; onejs-ui 0.0.4 or older on onejs-react 0.2.2 reopens an overlay when its trigger is pressed.
- **Unity UI Toolkit coupling.** Because the form controls restyle *real* native UITK controls, the component sheets select UITK-internal element classes (`unity-toggle__checkmark`, `unity-base-slider__dragger`, `unity-text-field__input`, `unity-radio-button__checkmark-background`, …) and `applyTheme` overrides a few `--unity-colors-*` panel vars. These are stable but undocumented Unity internals, verified on Unity 6.x. A UITK control-template rename could require updating the matching selectors.

## Install

```bash
npm install onejs-ui
```

onejs-ui's styles are CSS Modules (`.module.uss`), so your esbuild needs onejs-unity's `ussModulesPlugin` (the OneJS scaffold's `esbuild.config.mjs` already has it). Build once before type-checking: the plugin writes the `.module.uss.d.ts` files TypeScript reads. Outside a OneJS project, TypeScript also needs the runtime globals the scaffold's `types/global.d.ts` declares (`__root`, `__eventAPI`, `console`, the timers and more): copy that file.

## Quickstart

Wrap your app in `<ThemeProvider>`, which applies the theme **and** initializes the focus-visible manager. Everything inside gets themed components with working focus rings.

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
| **Feedback** | `Badge`, toasts (`ToastProvider` + `useToast`) |
| **Overlays** | `Popover`, `Dialog`, `DropdownMenu` (+ `MenuItem`, `MenuSeparator`), `Drawer`, `Tooltip` |
| **Foundations** | `ThemeProvider`/`useTheme`, `FocusScope`/`FocusManager`, `Overlay`/`Scrim`, `useAnchoredPosition`/`useDismiss`, `useMenuNavigation`, `usePresence`/`motion` |
| **Utilities** | `cx` (class names), `synthesizedClick` (the click a keyboard or gamepad choice passes to `onClick`/`onChange`) |

Controlled inputs take `value` + `onChange(value)` (a plain value, not an event; `Select` also passes the choosing click as a second argument):

```tsx
<Switch label="Notifications" value={on} onChange={setOn} />
<Slider value={vol} lowValue={0} highValue={100} onChange={setVol} />
<Select value={fruit} options={FRUITS} onChange={setFruit} />
```

## Theming

A theme is a plain token object (`ThemeTokens`). `applyTheme(tokens)` emits it as `--ojs-*` USS custom properties on the render root; `<ThemeProvider>` wraps that and exposes `useTheme()` → `{ tokens, setTheme }`. Swapping themes is a single, cheap operation: Unity re-resolves `var()` against the new values with no React re-render.

```tsx
import { ThemeProvider, darkTheme, type ThemeTokens } from "onejs-ui"

// Custom theme: start from a default and override.
const brand: ThemeTokens = { ...darkTheme, primary: "#7c5cff", ring: "#cdb8ff" }

<ThemeProvider theme={brand}>…</ThemeProvider>
```

Components reference tokens only through `var(--ojs-*)` in their `.module.uss` files. (Inline `style=` can't read USS variables, so it's never used for themeable properties.)

Themes can also dress `Card` and `Button` in **9-slice frames** purely through optional decoration tokens (`cardImage` / `buttonImage` + slice insets), set typography globally via the optional `font` token, and be **referenced by name** once registered (`<ThemeProvider theme="dark">`, `setTheme("pixel")`). See the [theming guide](https://onejs.com/docs/onejs-ui/theming).

## Focus & navigation

`onejs-ui` ships a **focus-visible** model: the themeable ring shows only while the input modality is keyboard/gamepad and is suppressed on pointer use. `<ThemeProvider>` initializes it automatically, so all built-in controls get correct nav rings with **zero per-app wiring**. The ring paints in the `ring` token at a uniform width across every control (the optional `focusWidth` token, default `2px`) and stays visible even on sprite-skinned themes that zero a control's resting border.

For overlays and custom regions:

- `<FocusScope>`: autofocus, focus restoration, and an optional focus trap (used by `Dialog`/`Drawer`).
- `useFocusVisible()`: returns `{ modality: "pointer" | "keyboard" }` for app-level hints.
- `RING_CLASS`: add it to your own focusable View and the manager paints the themed ring on keyboard focus (the reusable `ring` primitive). (`FOCUS_RING_CLASS` is the class the manager toggles internally.)

Open `Select` and `DropdownMenu` menus take Arrow, Home, End, Enter and Escape (`useMenuNavigation`), and a `RadioGroup` rings its entry radio under **Tab** as well as under arrow navigation.

## Development

```bash
npm run typecheck   # tsc --noEmit
npm test            # node --test over src/**/*.test.ts
npm run lint        # ESLint
```

## Design principles

- **Game-engine first.** Built for UI Toolkit and gamepad/keyboard navigation. Web-only patterns (data grids, breadcrumbs, calendars, command palettes) are intentionally out of scope.
- **Class-driven theming.** Components style themselves through USS classes that read `--ojs-*` custom properties, so a theme swap is one variables-sheet recompile.
- **Flat, minimal aesthetics.** UI Toolkit has no `box-shadow`, so depth comes from surface-contrast layering and borders.
- **Cheap by construction.** Most components are pure-TSX composites over `onejs-react` primitives, styled by embedded CSS Modules. No custom C# required.

## License

MIT
