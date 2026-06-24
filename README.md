# onejs-ui

Themeable component library for [OneJS v3](https://onejs.com) (React 19 on Unity UI Toolkit).

> **Status: M0 scaffold.** This is the proof slice (theme engine + Button, Card, Text) used to validate the theming + build chain before the full component set lands. See the roadmap below.

## Design principles

- **Game-engine first.** Built for Unity UI Toolkit and gamepad/keyboard navigation, not a web library ported over. Web-only patterns (data grids, breadcrumbs, calendars, command palettes) are intentionally out of scope.
- **Class-driven theming.** Components style themselves through USS classes that reference `--ojs-*` custom properties. Swapping a theme recompiles one small variables sheet and Unity re-resolves the cascade natively: no React re-render, no per-element style re-marshal. (Inline `style=` cannot read USS variables, so it is never used for themeable properties.)
- **Flat, minimal aesthetics.** UI Toolkit has no `box-shadow`, so depth comes from surface-contrast layering and borders. The one premium depth cue is OneJS's GPU `FrostedGlass`.
- **Cheap by construction.** Most components are pure-TSX composites over `onejs-react` primitives, styled by embedded CSS Modules. No custom C# required.

## Install

`onejs-ui` ships raw TS/TSX source; your app's esbuild bundles it (same model as `onejs-react`).

```bash
npm install onejs-ui
# local dev in this repo:
npm link onejs-ui
```

`react` and `onejs-react` are peer dependencies.

## Usage

```tsx
import { render } from "onejs-react"
import { ThemeProvider, Card, Button, Text, useTheme, darkTheme, lightTheme } from "onejs-ui"

function App() {
  const { tokens, setTheme } = useTheme()
  return (
    <Card style={{ width: 320 }}>
      <Text size="lg">onejs-ui</Text>
      <Text tone="muted">Themed via USS variables.</Text>
      <Button intent="primary" onClick={() => setTheme(tokens === darkTheme ? lightTheme : darkTheme)}>
        Toggle theme
      </Button>
    </Card>
  )
}

render(
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>,
  __root
)
```

## Theming

Themes are plain token objects (`ThemeTokens`). `applyTheme(tokens)` emits them as
`--ojs-*` USS custom properties on the render root; `<ThemeProvider>` wraps that and
exposes `useTheme()` (`{ tokens, setTheme }`). Ship a custom theme by passing your own
`ThemeTokens` object. Components reference tokens only via `var(--ojs-*)` in their
`.module.uss` files.

## Roadmap

- **M0 (this):** theme engine + Button, Card, Text. Validate CSS-module embedding, `var()` theming + live swap, hot reload, native + WebGL builds.
- **M1:** foundations (overlay/positioning, focus + controller/keyboard navigation, motion).
- **M2:** form controls (Switch, Checkbox, Radio, Slider, Select, ...), rebuilt on raw View.
- **M3:** overlays (Tooltip, Popover, Dialog, Dropdown, ContextMenu, Drawer, Toast).
- **M4:** layout, typography, feedback, light navigation.
- **Game pack (separate):** HUD bars, radial menu, inventory grid, dialogue, button prompts.
