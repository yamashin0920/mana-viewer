import type { Annotation } from '../../types'

interface AnnotationSidebarProps {
  annotations: Annotation[]
  onJump: (page: number) => void
  onDelete: (id: string) => void
}

const typeLabel: Record<Annotation['type'], string> = {
  highlight: 'ハイライト',
  bookmark: 'ブックマーク',
  note: 'メモ',
  underline: '下線',
}

export function AnnotationSidebar({ annotations, onJump, onDelete }: AnnotationSidebarProps) {
  if (annotations.length === 0) {
    return <p className="text-sm text-slate-500">注釈はまだありません。テキストを選択するとハイライトできます。</p>
  }

  const sorted = [...annotations].sort((a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt))

  return (
    <ul className="space-y-2">
      {sorted.map((ann) => (
        <li key={ann.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <div className="mb-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onJump(ann.page)}
              className="font-medium text-blue-700 hover:underline"
            >
              p.{ann.page} · {typeLabel[ann.type]}
            </button>
            <button
              type="button"
              onClick={() => onDelete(ann.id)}
              className="text-xs text-red-500 hover:underline"
            >
              削除
            </button>
          </div>
          {ann.selectedText && (
            <p className="line-clamp-2 text-slate-600">「{ann.selectedText}」</p>
          )}
          {ann.note && <p className="mt-1 text-slate-500">{ann.note}</p>}
        </li>
      ))}
    </ul>
  )
}
