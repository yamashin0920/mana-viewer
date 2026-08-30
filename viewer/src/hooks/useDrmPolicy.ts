import { useEffect } from 'react'
import type { ContentPolicyResponse } from '../types'

/**
 * DRM ポリシーをビューア DOM に適用する。
 * クライアント側の緩和策であり、暗号的な強制ではない。
 */
export function useDrmPolicy(
  root: HTMLElement | null,
  policy: ContentPolicyResponse | null | undefined,
) {
  const allowPrint = policy?.allowPrint ?? true
  const allowCopy = policy?.drm?.allowCopy ?? true

  useEffect(() => {
    if (!root) return

    root.dataset.allowPrint = allowPrint ? 'true' : 'false'
    root.dataset.allowCopy = allowCopy ? 'true' : 'false'

    const onCopy = (event: ClipboardEvent) => {
      if (allowCopy) return
      event.preventDefault()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (allowPrint) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault()
      }
    }

    const onBeforePrint = () => {
      if (allowPrint) return
      document.documentElement.classList.add('drm-print-blocked')
    }

    const onAfterPrint = () => {
      document.documentElement.classList.remove('drm-print-blocked')
    }

    root.addEventListener('copy', onCopy)
    root.addEventListener('cut', onCopy)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)

    return () => {
      root.removeEventListener('copy', onCopy)
      root.removeEventListener('cut', onCopy)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('afterprint', onAfterPrint)
      document.documentElement.classList.remove('drm-print-blocked')
      delete root.dataset.allowPrint
      delete root.dataset.allowCopy
    }
  }, [root, allowPrint, allowCopy])
}
