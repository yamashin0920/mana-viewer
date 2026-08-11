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
