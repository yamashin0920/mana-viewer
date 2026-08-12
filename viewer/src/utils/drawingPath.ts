import type { AnnotationRect } from '../types'

export interface DrawingPoint {
  x: number
  y: number
}

export interface DrawingPathData {
  points: DrawingPoint[]
}

export function serializeDrawingPath(points: DrawingPoint[]): string {
  return JSON.stringify({ points })
}

export function parseDrawingPath(note: string | null | undefined): DrawingPathData | null {
  if (!note) return null
  try {
    const parsed = JSON.parse(note) as DrawingPathData
    if (!Array.isArray(parsed.points) || parsed.points.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export function getDrawingBoundingBox(points: DrawingPoint[]): AnnotationRect {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  }
}

export function pointsToSvgPath(points: DrawingPoint[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`
}
