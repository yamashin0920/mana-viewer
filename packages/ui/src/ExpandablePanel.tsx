import { useId, type ReactNode } from 'react'
import { Button } from './Button'

/**
 * 押すと中身を展開するトレイ。
 * 広い画面（lg+）では常にインライン表示し、狭い画面ではトグルの後ろにしまう。
 */
export function ExpandablePanel({
  label,
  open,
  onOpenChange,
  children,
  testId = 'expandable-panel',
}: {
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  testId?: string
}) {
  const reactId = useId()
  const panelId = `${testId}-${reactId}`

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0 lg:hidden"
        data-testid={`${testId}-toggle`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        {label}
      </Button>
      <div
        id={panelId}
        data-testid={testId}
        className={
          open
            ? 'order-last flex w-full flex-wrap items-center gap-1 lg:order-none lg:w-auto lg:flex-nowrap'
            : 'hidden lg:flex lg:items-center lg:gap-1'
        }
      >
        {children}
      </div>
    </>
  )
}
