import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search } from 'lucide-react'
import { fetchBookshelves } from '../api/bookshelves'
import { fetchContents } from '../api/contents'
import { AppHeader } from '../components/layout/AppHeader'
import { ContentCard } from '../components/bookshelf/ContentCard'
import { RecentlyReadSection } from '../components/bookshelf/RecentlyReadSection'
import { ContentCardSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import type { Content } from '../types'

export function BookshelfPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const { data: shelves, isLoading: shelvesLoading } = useQuery({
    queryKey: ['bookshelves'],
    queryFn: fetchBookshelves,
  })

  const { data: contents, isLoading: contentsLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: () => fetchContents(),
  })

  const distributed = shelves?.data.find((s) => s.type === 'distributed')
  const isLoading = shelvesLoading || contentsLoading

  const categories = useMemo(() => {
    const cats = new Set(contents?.data.map((c) => c.category).filter(Boolean) as string[])
    return ['all', ...Array.from(cats)]
  }, [contents])

  const filtered = useMemo(() => {
    if (!contents?.data) return []
    return contents.data.filter((c) => {
      if (category !== 'all' && c.category !== category) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [contents, query, category])

  const recentlyRead = useMemo(() => {
    if (!contents?.data) return [] as Content[]
    return [...contents.data]
      .filter((c) => c.progress?.lastReadAt)
      .sort((a, b) => {
        const aTime = a.progress?.lastReadAt ?? ''
        const bTime = b.progress?.lastReadAt ?? ''
        return bTime.localeCompare(aTime)
      })
      .slice(0, 6)
  }, [contents])

  const inProgress = filtered.filter((c) => (c.progress?.currentPage ?? 0) > 1)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-medium text-indigo-200">{distributed?.name ?? '配布教材'}</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">本棚</h2>
          <p className="mt-2 max-w-lg text-sm text-indigo-100">
            ライセンスのある教材を閲覧できます。前回の続きから読み進めましょう。
          </p>
          {!isLoading && (
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur">
                <span className="block text-indigo-200">教材数</span>
                <span className="text-xl font-bold">{filtered.length}</span>
              </div>
              <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur">
                <span className="block text-indigo-200">読書中</span>
                <span className="text-xl font-bold">{inProgress.length}</span>
              </div>
            </div>
          )}
        </div>

        {!isLoading && recentlyRead.length > 0 && <RecentlyReadSection items={recentlyRead} />}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="教材名・著者・タグで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'すべて' : cat}
              </button>
            ))}
          </div>
        </div>

        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">すべての教材</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="教材が見つかりません"
            description={
              query || category !== 'all'
                ? '検索条件を変更してみてください'
                : '表示できる教材がありません'
            }
          />
        )}
      </main>
    </div>
  )
}
