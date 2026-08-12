import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface NoteDialogProps {
  open: boolean
  selectedText?: string
  note: string
  onNoteChange: (note: string) => void
  onClose: () => void
  onSave: () => void
  saving?: boolean
}

export function NoteDialog({
  open,
  selectedText,
  note,
  onNoteChange,
  onClose,
  onSave,
  saving,
}: NoteDialogProps) {
  return (
    <Modal
      open={open}
      title="メモを追加"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={saving || !note.trim()}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </>
      }
    >
      {selectedText && (
        <blockquote className="mb-4 rounded-xl border-l-4 border-brand-400 bg-brand-50 px-4 py-3 text-sm text-slate-700 dark:bg-brand-950/30 dark:text-slate-300">
          {selectedText}
        </blockquote>
      )}
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="メモを入力..."
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
        autoFocus
      />
    </Modal>
  )
}
