import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error'
  text: string
}

let pushToast: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null

export function toast(text: string, type: ToastMessage['type'] = 'success') {
  pushToast?.({ text, type })
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => {
    pushToast = (msg) => {
      const id = crypto.randomUUID()
      setItems((prev) => [...prev, { ...msg, id }])
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id))
      }, 2800)
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
        </div>
      ))}
    </div>
  )
}
