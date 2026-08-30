import type { ReactNode } from 'react'

/** ページ先頭のタイトルとアクション枠。ボタンの置き場所を右スロットに固定する */
export function PageHeader({
  title,
  description,
  actions,
  testId,
  className = '',
}: {
  title: string
  description?: string
  actions?: ReactNode
  testId?: string
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`} data-testid={testId}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
