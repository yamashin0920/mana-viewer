import { useEffect } from 'react'

export function useKeyboardNavigation(options: {
  onPrev: () => void
  onNext: () => void
  enabled?: boolean
}) {
  const { onPrev, onNext, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        onPrev()
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        onNext()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onPrev, onNext])
}

export function spreadPageStep(page: number, direction: 'prev' | 'next', pageCount: number): number {
  if (direction === 'prev') {
    if (page <= 1) return 1
    return Math.max(1, page - 2)
  }
  if (page + 2 <= pageCount) return page + 2
  if (page + 1 <= pageCount) return page + 1
  return page
}

export function singlePageStep(page: number, direction: 'prev' | 'next', pageCount: number): number {
  if (direction === 'prev') return Math.max(1, page - 1)
  return Math.min(pageCount, page + 1)
}
