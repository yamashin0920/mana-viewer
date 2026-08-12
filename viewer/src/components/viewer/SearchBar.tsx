import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface SearchBarProps {
  open: boolean
  query: string
  matchCount: number
  activeMatchIndex: number
  searching?: boolean
  onOpenChange: (open: boolean) => void
  onQueryChange: (query: string) => void
  onPrev: () => void
  onNext: () => void
}

export function SearchBar({
  open,
  query,
  matchCount,
  activeMatchIndex,
  searching,
  onOpenChange,
  onQueryChange,
  onPrev,
  onNext,
}: SearchBarProps) {
  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        data-testid="search-toggle"
        onClick={() => onOpenChange(true)}
        aria-label="テキスト検索"
        title="テキスト検索 (Ctrl+F)"
        className="shrink-0"
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  const status =
    !query.trim()
      ? '検索語を入力'
      : searching
        ? '検索中...'
        : matchCount === 0
          ? '一致なし'
          : `${activeMatchIndex + 1} / ${matchCount}`

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800 sm:max-w-xs lg:max-w-sm"
      data-testid="search-bar"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
      <input
        type="search"
        data-testid="search-input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="PDF内を検索..."
        className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm outline-none dark:text-slate-100"
        aria-label="PDF内テキスト検索"
      />
      <span className="hidden shrink-0 px-1 text-xs text-slate-400 sm:inline" data-testid="search-status">
        {status}
      </span>
      <Button
        variant="ghost"
        size="icon"
        data-testid="search-prev"
        onClick={onPrev}
        disabled={matchCount === 0}
        aria-label="前の一致"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        data-testid="search-next"
        onClick={onNext}
        disabled={matchCount === 0}
        aria-label="次の一致"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        data-testid="search-close"
        onClick={() => {
          onQueryChange('')
          onOpenChange(false)
        }}
        aria-label="検索を閉じる"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
