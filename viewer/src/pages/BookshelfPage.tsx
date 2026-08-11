import { useQuery } from '@tanstack/react-query'
import { fetchBookshelves } from '../api/bookshelves'
import { fetchContents } from '../api/contents'
import { AppHeader } from '../components/layout/AppHeader'
import { ContentCard } from '../components/bookshelf/ContentCard'

export function BookshelfPage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">本棚</h2>
          <p className="mt-1 text-slate-600">
            {distributed?.name ?? '配布教材'} — ライセンスのある教材を閲覧できます
          </p>
        </div>

        {isLoading ? (
          <p className="text-slate-500">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contents?.data.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}

        {!isLoading && contents?.data.length === 0 && (
          <p className="text-slate-500">表示できる教材がありません。</p>
        )}
      </main>
    </div>
  )
}
