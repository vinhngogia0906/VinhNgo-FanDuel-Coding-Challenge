import { useCallback, useState } from "react";

export type ToastKind = 'success' | 'error'
export type ToastItem = { id: number; kind: ToastKind; message: string }

let nextId = 1

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++
    setToasts(t => [...t, { id, kind, message }])
    const ttl = kind === 'error' ? 6000 : 4000
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl)
  }, [])

  return {
    toasts,
    success: (m: string) => push('success', m),
    error:   (m: string) => push('error', m),
  }
}