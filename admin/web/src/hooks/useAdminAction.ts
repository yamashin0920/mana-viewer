import { useCallback, useState } from 'react'
import { ApiError } from '../api/client'
import type { AlertTone } from '../components/Alert'

export interface Feedback {
  tone: AlertTone
  message: string
}

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return err.message || 'この操作を行う権限がありません'
    if (err.status === 401) return 'セッションの有効期限が切れました。再度ログインしてください'
    return err.message || fallback
  }
  return err instanceof Error ? err.message : fallback
}

/**
 * 管理画面の書き込み操作を包む。
 * 送信中フラグで二重送信を防ぎ、成否を必ず画面に出す。
 */
export function useAdminAction() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const run = useCallback(
    async (action: () => Promise<void>, successMessage: string, fallbackError = '操作に失敗しました') => {
      setSubmitting(true)
      setFeedback(null)
      try {
        await action()
        setFeedback({ tone: 'success', message: successMessage })
        return true
      } catch (err) {
        setFeedback({ tone: 'error', message: toMessage(err, fallbackError) })
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  return { submitting, feedback, setFeedback, run }
}
