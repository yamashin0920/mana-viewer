import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  'data-testid'?: string
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  'data-testid': testId = 'modal',
}: ModalProps) {
  const titleId = useId()
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useFocusTrap(panel, open)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // ダイアログの背後をスクロールできてしまうと、開いていることが伝わりにくい
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* 背景は装飾。閉じる操作はヘッダーのボタンと Escape が担うため支援技術からは隠す */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={setPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-slide-up relative w-full max-w-md rounded-2xl bg-white shadow-[var(--shadow-float)] outline-none dark:bg-slate-900"
        data-testid={testId}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-700">{footer}</div>}
      </div>
    </div>
  )
}
