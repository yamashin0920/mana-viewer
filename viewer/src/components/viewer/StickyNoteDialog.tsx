import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface StickyNoteDialogProps {
  open: boolean
  note: string
  onNoteChange: (note: string) => void
  onClose: () => void
  onSave: () => void
  saving?: boolean
}

export function StickyNoteDialog({
  open,
  note,
  onNoteChange,
  onClose,
  onSave,
  saving,
}: StickyNoteDialogProps) {
  return (
    <Modal
      open={open}
      title="付箋を追加"
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
      <textarea
        id="sticky-note-input"
        data-testid="sticky-note-input"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="付箋の内容を入力..."
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-yellow-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-yellow-950/30 dark:text-slate-100"
      />
    </Modal>
  )
}
