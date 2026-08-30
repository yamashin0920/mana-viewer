import { useEffect, useRef } from 'react'

interface UsePinchZoomOptions {
  zoom: number
  min: number
  max: number
  onZoomChange: (zoom: number) => void
  enabled?: boolean
}

function distance(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * 2 本指のピンチで拡大率を変える。
 * ツールバーのズームボタンは狭い画面で押しづらいため、タッチでの拡大手段として必要。
 *
 * 対象要素は ref オブジェクトではなく実体を受け取る。ビューアは読み込み中に
 * 別のツリーを描画するため、要素が現れたタイミングでリスナーを張り直す必要がある。
 */
export function usePinchZoom(
  target: HTMLElement | null,
  { zoom, min, max, onZoomChange, enabled = true }: UsePinchZoomOptions
) {
  // リスナーを張り替えずに最新値を読むための ref
  const zoomRef = useRef(zoom)
  const onZoomChangeRef = useRef(onZoomChange)
  zoomRef.current = zoom
  onZoomChangeRef.current = onZoomChange

  useEffect(() => {
    if (!target || !enabled) return

    let startDistance = 0
    let startZoom = 1

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      startDistance = distance(e.touches[0], e.touches[1])
      startZoom = zoomRef.current
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || startDistance === 0) return
      // ブラウザ標準のピンチズームと二重に効かないよう抑止する
      e.preventDefault()
      const scale = distance(e.touches[0], e.touches[1]) / startDistance
      const next = Math.min(max, Math.max(min, startZoom * scale))
      // 0.05 刻みに丸めて再描画の回数を抑える
      const rounded = Math.round(next * 20) / 20
      if (rounded !== zoomRef.current) onZoomChangeRef.current(rounded)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) startDistance = 0
    }

    target.addEventListener('touchstart', handleTouchStart, { passive: true })
    target.addEventListener('touchmove', handleTouchMove, { passive: false })
    target.addEventListener('touchend', handleTouchEnd, { passive: true })
    target.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchmove', handleTouchMove)
      target.removeEventListener('touchend', handleTouchEnd)
      target.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [target, enabled, min, max])
}
