import { useEffect } from 'react'
import { flushOfflineQueues } from '../db/syncFlush'

/** オンライン復帰時・起動時にオフラインキューをフラッシュする */
export function useOfflineSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const run = () => {
      flushOfflineQueues().catch(() => undefined)
    }

    // 起動直後は認証完了を少し待つ
    const timer = window.setTimeout(() => {
      if (!cancelled) run()
    }, 500)

    window.addEventListener('online', run)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('online', run)
    }
  }, [enabled])
}
