import { Check, Copy, Link2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface ShareAnnotationsDialogProps {
  open: boolean
  shareUrl: string | null
  expiresAt: string | null
  annotationCount: number
  loading?: boolean
  onClose: () => void
}

export function ShareAnnotationsDialog({
  open,
  shareUrl,
  expiresAt,
  annotationCount,
  loading,
  onClose,
}: ShareAnnotationsDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Modal
      open={open}
      title="注釈を共有"
      onClose={onClose}
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          閉じる
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">共有リンクを作成中...</p>
      ) : shareUrl ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {annotationCount} 件の注釈を共有するリンクを作成しました。リンクを知っているユーザーは、同じ教材のライセンスを持っていれば注釈を閲覧できます。
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800">
            <Link2 className="h-4 w-4 shrink-0 text-brand-600" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              data-testid="share-url-input"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
            />
            <Button
              variant="secondary"
              size="sm"
              data-testid="share-copy-button"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  コピー
                </>
              )}
            </Button>
          </div>
          {expiresLabel && (
            <p className="text-xs text-slate-400">有効期限: {expiresLabel}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">共有リンクを作成できませんでした。</p>
      )}
    </Modal>
  )
}
