import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Undo2, XCircle } from 'lucide-react'

export interface ToastAction {
  label: string
  onAction: () => void
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error'
  text: string
  action?: ToastAction
}

const DEFAULT_DURATION = 2800
/** Undo などの操作を提示する間は、押す時間を確保するため長めに表示する。 */
const ACTION_DURATION = 8000

let pushToast: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null

export function toast(
  text: string,
  type: ToastMessage['type'] = 'success',
  action?: ToastAction
) {
  pushToast?.({ text, type, action })
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    pushToast = (msg) => {
      const id = crypto.randomUUID()
      setItems((prev) => [...prev, { ...msg, id }])
      setTimeout(
        () => setItems((prev) => prev.filter((t) => t.id !== id)),
        msg.action ? ACTION_DURATION : DEFAULT_DURATION
      )
    }
    return () => {
      pushToast = null
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          data-testid="toast"
          className={`animate-slide-up flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-[var(--shadow-float)] ${
            item.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {item.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {item.text}
          {item.action && (
            <button
              type="button"
              data-testid="toast-action"
              onClick={() => {
                item.action?.onAction()
                dismiss(item.id)
              }}
              className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold transition hover:bg-white/25"
            >
              <Undo2 className="h-3 w-3" />
              {item.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
