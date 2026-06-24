// Ambient declarations for the OneJS runtime globals and USS Module imports
// that onejs-ui relies on. The consuming app provides the real implementations
// at runtime (QuickJSBootstrap) and the esbuild ussModulesPlugin transforms the
// `.module.uss` imports at build time. These declarations exist so the package
// typechecks standalone (`npm run typecheck`).

// Runtime StyleSheet API (QuickJSBootstrap globals)
declare function compileStyleSheet(ussContent: string, name?: string): boolean
declare function loadStyleSheet(path: string): boolean
declare function removeStyleSheet(name: string): boolean
declare function clearStyleSheets(): number

// The React render root (Unity panel root VisualElement proxy)
declare const __root: any

// Runtime scheduling globals (QuickJSBootstrap)
declare function requestAnimationFrame(callback: (time: number) => void): number
declare function cancelAnimationFrame(id: number): void

// Low-level event API (QuickJSBootstrap) for global listeners not tied to a
// rendered element (e.g. outside-press / Escape dismissal on __root).
declare const __eventAPI: {
  addEventListener: (element: any, eventType: string, callback: (e: any) => void) => void
  removeEventListener: (element: any, eventType: string, callback: (e: any) => void) => void
  removeAllEventListeners: (element: any) => void
}

// USS Modules: `import styles from "./Foo.module.uss"` -> scoped class-name map
declare module "*.module.uss" {
  const classes: Record<string, string>
  export default classes
}
