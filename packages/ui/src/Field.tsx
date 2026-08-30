import { useId } from 'react'

interface FieldProps {
  label: string
  hint?: string
  required?: boolean
  className?: string
  /** 生成した id を受け取り、対応するコントロールを返す */
  children: (id: string) => React.ReactNode
}

/**
 * ラベルとコントロールを確実に紐づける。
 * `<label>` を置きながら htmlFor を忘れる（＝支援技術には紐づかない）事故を防ぐため、
 * id は必ずこのコンポーネントが生成して渡す。
 */
export function Field({ label, hint, required, className = '', children }: FieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
