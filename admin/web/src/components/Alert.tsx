import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export type AlertTone = 'error' | 'success' | 'info'

interface AlertProps {
  tone: AlertTone
  message: string
  onDismiss?: () => void
}

const tones: Record<AlertTone, { className: string; icon: typeof Info }> = {
  error: {
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
    icon: AlertCircle,
  },
  success: {
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
    icon: CheckCircle2,
  },
  info: {
    className:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: Info,
  },
}

export function Alert({ tone, message, onDismiss }: AlertProps) {
  const { className, icon: Icon } = tones[tone]
  return (
    <div
      data-testid={`alert-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="閉じる"
          className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
