import type { ToastItem } from './useToast'

export function ToastRegion({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={`toast${t.kind === 'error' ? ' toast--error' : ''}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}