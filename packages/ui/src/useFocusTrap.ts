import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * ダイアログ内にフォーカスを閉じ込め、閉じたときに元の要素へ戻す。
 * これが無いとキーボード利用者は背後の要素へタブ移動できてしまう。
 *
 * 初期フォーカス先は `data-autofocus` を付けた要素、無ければ最初の操作可能な要素。
 * React の `autoFocus` はコミット中に発火して呼び出し元のフォーカスを奪うため、
 * 復帰先を取り違えないよう初期フォーカスはこのフックに集約する。
 */
export function useFocusTrap(container: HTMLElement | null, active: boolean) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // container が入るのは 1 フレーム後になるため、開いた時点の active 要素を先に控える
  useEffect(() => {
    if (!active) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    return () => {
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [active])

  useEffect(() => {
    if (!container || !active) return

    const focusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )

    const preferred = container.querySelector<HTMLElement>('[data-autofocus]')
    ;(preferred ?? focusable()[0] ?? container).focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement

      if (e.shiftKey && (current === first || current === container)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [container, active])
}
