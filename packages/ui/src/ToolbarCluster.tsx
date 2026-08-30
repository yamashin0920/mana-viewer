import type { ReactNode } from 'react'

/** ツールバー内のまとまった操作グループ（ページ送り・ズーム・ツール切替など） */
export function ToolbarCluster({
  children,
  className = '',
  testId,
}: {
  children: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={`flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800 ${className}`}
    >
      {children}
    </div>
  )
}
