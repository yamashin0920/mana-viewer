import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  detail,
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      data-testid="confirm-dialog"
      footer={
        <>
          <Button size="md" onClick={onCancel} data-testid="confirm-dialog-cancel">
            {cancelLabel}
          </Button>
          <Button
            size="md"
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
            data-testid="confirm-dialog-confirm"
          >
            {busy ? '処理中...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-700 dark:text-slate-200">{message}</p>
      {detail && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {detail}
        </p>
      )}
    </Modal>
  )
}
