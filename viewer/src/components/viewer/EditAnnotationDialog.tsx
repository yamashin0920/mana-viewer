import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { HIGHLIGHT_COLORS } from '../../constants/highlightColors'
import { PEN_COLORS } from '../../constants/penColors'
import type { Annotation } from '../../types'

interface EditAnnotationDialogProps {
  open: boolean
  annotation: Annotation | null
  note: string
  color: string
  onNoteChange: (note: string) => void
  onColorChange: (color: string) => void
  onClose: () => void
  onSave: () => void
  saving?: boolean
}

export function EditAnnotationDialog({
  open,
  annotation,
  note,
  color,
  onNoteChange,
  onColorChange,
  onClose,
  onSave,
  saving,
}: EditAnnotationDialogProps) {
  if (!annotation) return null

  const showHighlightColors = annotation.type === 'highlight' || annotation.type === 'underline'
  const showPenColors = annotation.type === 'drawing'
  const title =
    annotation.type === 'highlight'
      ? 'ハイライトを編集'
      : annotation.type === 'bookmark'
        ? 'ブックマークを編集'
        : annotation.type === 'note'
          ? 'メモを編集'
          : annotation.type === 'sticky'
            ? '付箋を編集'
            : annotation.type === 'drawing'
              ? '描画を編集'
              : '注釈を編集'

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          p.{annotation.page} · {annotation.type}
        </p>

        {annotation.selectedText && (
          <blockquote className="rounded-xl border-l-4 border-brand-400 bg-brand-50 px-4 py-3 text-sm text-slate-700 dark:bg-brand-950/30 dark:text-slate-300">
            {annotation.selectedText}
          </blockquote>
        )}

        {showHighlightColors && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">色</p>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => onColorChange(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        )}

        {showPenColors && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">ペンの色</p>
            <div className="flex gap-2">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => onColorChange(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c.value ? 'border-brand-600 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        )}

        {annotation.type !== 'drawing' && (
          <div>
            <label htmlFor="edit-note" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {annotation.type === 'highlight' ? 'メモ（任意）' : '内容'}
            </label>
            <textarea
              id="edit-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="メモを入力..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
