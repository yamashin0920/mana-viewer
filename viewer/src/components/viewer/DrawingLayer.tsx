import { useCallback, useRef, useState } from 'react'
import type { DrawingPoint } from '../../utils/drawingPath'
import { pointsToSvgPath } from '../../utils/drawingPath'

interface DrawingLayerProps {
  active: boolean
  color: string
  onComplete: (points: DrawingPoint[]) => void
}

export function DrawingLayer({ active, color, onComplete }: DrawingLayerProps) {
  const [previewPoints, setPreviewPoints] = useState<DrawingPoint[]>([])
  const pointsRef = useRef<DrawingPoint[]>([])
  const drawingRef = useRef(false)

  const getPoint = useCallback((event: React.PointerEvent<SVGSVGElement>): DrawingPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      drawingRef.current = true
      const point = getPoint(event)
      pointsRef.current = [point]
      setPreviewPoints([point])
    },
    [active, getPoint]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!active || !drawingRef.current) return
      event.preventDefault()
      const point = getPoint(event)
      pointsRef.current = [...pointsRef.current, point]
      setPreviewPoints(pointsRef.current)
    },
    [active, getPoint]
  )

  const finishDrawing = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!drawingRef.current) return
      drawingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      const point = getPoint(event)
      const points = [...pointsRef.current, point]
      pointsRef.current = []
      setPreviewPoints([])
      if (points.length >= 2) {
        onComplete(points)
      }
    },
    [getPoint, onComplete]
  )

  if (!active && previewPoints.length === 0) {
    return null
  }

  return (
    <svg
      data-testid="drawing-layer"
      className={`absolute inset-0 touch-none ${active ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrawing}
      onPointerLeave={finishDrawing}
    >
      {previewPoints.length >= 2 && (
        <path
          d={pointsToSvgPath(previewPoints)}
          stroke={color}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
