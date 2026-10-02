import { useMemo, useState } from "react"

/**
 * Controlled or uncontrolled state, the way every onejs-ui component that owns
 * a value works: pass `value` and the caller owns it; leave it undefined and
 * the component owns it, starting from `defaultValue`. Either way `onChange`
 * hears every change, so a caller can listen without taking ownership.
 *
 * Each hook here is React state handed to a pure core below it. The cores are
 * where the decisions live, and they are what the tests exercise.
 */
export interface ControllableStateOptions<T> {
  /** The controlled value. `undefined` means uncontrolled; `false`, `0` and `""` are values. */
  value: T | undefined
  /** Starting value when uncontrolled. Read on the first render only. */
  defaultValue: T
  /** Called with every requested change, controlled or not. */
  onChange?: (value: T) => void
}

/**
 * The setter a controllable component hands out. A controlled component never
 * writes its own state, it only asks the owner through `onChange`; an
 * uncontrolled one tells the listener and writes its own state.
 */
export function controllableSetter<T>(
  controlled: boolean,
  onChange: ((value: T) => void) | undefined,
  setOwn: (value: T) => void
): (next: T) => void {
  return (next) => {
    onChange?.(next)
    if (!controlled) setOwn(next)
  }
}

/** The pure core of `useControllableState`, over the component's own state. */
export function controllableState<T>(
  { value, onChange }: ControllableStateOptions<T>,
  own: T,
  setOwn: (value: T) => void
): [T, (next: T) => void] {
  const controlled = value !== undefined
  return [controlled ? value : own, controllableSetter(controlled, onChange, setOwn)]
}

/**
 * `useState` that a caller can take over. Returns `[value, setValue]`; the
 * setter keeps its identity while ownership and `onChange` stay the same.
 */
export function useControllableState<T>({ value, defaultValue, onChange }: ControllableStateOptions<T>): [T, (next: T) => void] {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const setValue = useMemo(() => controllableSetter(controlled, onChange, setOwn), [controlled, onChange])
  return [controlled ? value : own, setValue]
}

/** The open-state props every onejs-ui overlay accepts. */
export interface OpenStateOptions {
  /** Controlled open state. Omit it and the component owns its open state. */
  open?: boolean
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean
  /** Called with the requested open state whenever it should change. */
  onOpenChange?: (open: boolean) => void
  /** @deprecated Use `onOpenChange`, which is called with `false` whenever this is. */
  onClose?: () => void
}

export interface OpenActions {
  setOpen: (open: boolean) => void
  /**
   * Requests closing, or `undefined` when nobody could act on it: a controlled
   * overlay with no listener. Overlays hand it to their dismissal, so such an
   * overlay registers no Escape or outside press handling.
   */
  close: (() => void) | undefined
}

export interface OpenState extends OpenActions {
  open: boolean
}

/**
 * Folds the deprecated `onClose` into `onOpenChange`: the canonical callback
 * hears every change first, then `onClose` hears closing. Returns `undefined`
 * when neither is given, so "nobody is listening" stays detectable.
 */
export function openChangeHandler(
  onOpenChange: ((open: boolean) => void) | undefined,
  onClose: (() => void) | undefined
): ((open: boolean) => void) | undefined {
  if (!onOpenChange && !onClose) return undefined
  return (open) => {
    onOpenChange?.(open)
    if (!open) onClose?.()
  }
}

/** What an overlay can do about its open state, given who owns it and who listens. */
export function openActions(
  controlled: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
  onClose: (() => void) | undefined,
  setOwn: (open: boolean) => void
): OpenActions {
  const onChange = openChangeHandler(onOpenChange, onClose)
  const setOpen = controllableSetter(controlled, onChange, setOwn)
  const canClose = !controlled || onChange !== undefined
  return { setOpen, close: canClose ? () => setOpen(false) : undefined }
}

/** The pure core of `useOpenState`, over the component's own state. */
export function openState(
  { open, onOpenChange, onClose }: OpenStateOptions,
  own: boolean,
  setOwn: (open: boolean) => void
): OpenState {
  const controlled = open !== undefined
  return { open: controlled ? open : own, ...openActions(controlled, onOpenChange, onClose, setOwn) }
}

/**
 * Open state for an overlay: `open` / `defaultOpen` / `onOpenChange`, plus the
 * deprecated `onClose` where a component used to take it. `setOpen` and
 * `close` keep their identity while ownership and the callbacks stay the same.
 */
export function useOpenState({ open, defaultOpen = false, onOpenChange, onClose }: OpenStateOptions): OpenState {
  const [own, setOwn] = useState(defaultOpen)
  const controlled = open !== undefined
  const actions = useMemo(
    () => openActions(controlled, onOpenChange, onClose, setOwn),
    [controlled, onOpenChange, onClose]
  )
  return { open: controlled ? open : own, ...actions }
}
