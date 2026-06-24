import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react"
import { View, Text, Portal } from "onejs-react"
import { cx } from "../../utils/cx"
import { motion } from "../../foundation/motion"
import styles from "./Toast.module.uss"

export type ToastTone = "default" | "success" | "warning" | "danger" | "info"

export type ToastPlacement =
  | "top-left" | "top-right" | "top-center"
  | "bottom-left" | "bottom-right" | "bottom-center"

export interface ToastOptions {
  title?: string
  message: string
  tone?: ToastTone
  /** Auto-dismiss after this many ms. 0 keeps it until dismissed. Default 4000. */
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: number
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void
}
const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

const PLACEMENT: Record<ToastPlacement, string> = {
  "top-left": styles.topLeft,
  "top-right": styles.topRight,
  "top-center": styles.topCenter,
  "bottom-left": styles.bottomLeft,
  "bottom-right": styles.bottomRight,
  "bottom-center": styles.bottomCenter,
}

const TONE: Record<ToastTone, string | undefined> = {
  default: undefined,
  success: styles.toastSuccess,
  warning: styles.toastWarning,
  danger: styles.toastDanger,
  info: styles.toastInfo,
}

export interface ToastProviderProps {
  children?: ReactNode
  /** Corner the toast stack anchors to. Default "bottom-right". */
  placement?: ToastPlacement
}

/**
 * Hosts the toast queue and viewport. Wrap your app once, then call `useToast()`
 * from anywhere to push a transient notification. Toasts fade in, stack, and
 * auto-dismiss; the viewport ignores pointer input so only the toasts are
 * interactive.
 */
export function ToastProvider({ children, placement = "bottom-right" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: ToastOptions) => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, ...opts }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Portal>
        <View className={cx(styles.viewport, PLACEMENT[placement])} pickingMode="Ignore">
          {toasts.map((t) => (
            <ToastView key={t.id} item={t} onRemove={remove} />
          ))}
        </View>
      </Portal>
    </ToastContext.Provider>
  )
}

/** Returns a function to push a toast. Must be used under a ToastProvider. */
export function useToast() {
  return useContext(ToastContext).toast
}

// Exit fade duration; match --ojs-motion-base.
const TOAST_EXIT_MS = 200

function ToastView({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  const [shown, setShown] = useState(false)
  const leaving = useRef(false)

  const close = useCallback(() => {
    if (leaving.current) return
    leaving.current = true
    setShown(false)
    setTimeout(() => onRemove(item.id), TOAST_EXIT_MS)
  }, [item.id, onRemove])

  useEffect(() => {
    const rafIn = requestAnimationFrame(() => setShown(true))
    const duration = item.duration ?? 4000
    const timer = duration > 0 ? setTimeout(close, duration) : undefined
    return () => {
      cancelAnimationFrame(rafIn)
      if (timer) clearTimeout(timer)
    }
  }, [close, item.duration])

  return (
    <View
      className={cx(styles.toast, TONE[item.tone ?? "default"], motion.fade, shown ? motion.fadeOpen : motion.fadeClosed)}
      onClick={close}
    >
      {item.title ? <Text className={styles.title}>{item.title}</Text> : null}
      <Text className={styles.message}>{item.message}</Text>
    </View>
  )
}
