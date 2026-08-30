import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@mana/ui'

interface ConfirmRequest {
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
}

/**
 * ネイティブの confirm() を置き換える。
 * スタイルが当たらず、支援技術での扱いもブラウザ任せになるため、
 * ビューアと同じ ConfirmDialog に統一する。
 */
export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)
  const [busy, setBusy] = useState(false)

  const confirm = useCallback((next: ConfirmRequest) => setRequest(next), [])

  const handleConfirm = useCallback(async () => {
    if (!request) return
    setBusy(true)
    try {
      await request.onConfirm()
      setRequest(null)
    } finally {
      setBusy(false)
    }
  }, [request])

  const dialog = (
    <ConfirmDialog
      open={!!request}
      title={request?.title ?? ''}
      message={request?.message ?? ''}
      detail={request?.detail}
      confirmLabel={request?.confirmLabel ?? '削除する'}
      destructive
      busy={busy}
      onConfirm={handleConfirm}
      onCancel={() => setRequest(null)}
    />
  )

  return { confirm, dialog }
}
