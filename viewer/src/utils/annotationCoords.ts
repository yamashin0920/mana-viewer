import type { AnnotationRect } from '../types'
import type { DrawingPoint } from './drawingPath'

export const LEGACY_ANNOTATION_ZOOM = 1.2

export interface PageCoordContext {
  page: number
  viewportWidth: number
  viewportHeight: number
}

export function isNormalizedRects(rects: AnnotationRect[]): boolean {
  if (rects.length === 0) return true
  return rects.every(
    (rect) =>
      rect.x >= 0 &&
      rect.x <= 1 &&
      rect.y >= 0 &&
      rect.y <= 1 &&
      rect.width >= 0 &&
      rect.width <= 1 &&
      rect.height >= 0 &&
      rect.height <= 1
  )
}

export function normalizeRects(
  rects: AnnotationRect[],
  viewportWidth: number,
  viewportHeight: number
): AnnotationRect[] {
  if (viewportWidth <= 0 || viewportHeight <= 0) return rects
  return rects.map((rect) => ({
    x: rect.x / viewportWidth,
    y: rect.y / viewportHeight,
    width: rect.width / viewportWidth,
    height: rect.height / viewportHeight,
  }))
}

export function denormalizeRects(
  rects: AnnotationRect[],
  viewportWidth: number,
  viewportHeight: number
): AnnotationRect[] {
  if (viewportWidth <= 0 || viewportHeight <= 0) return rects
  return rects.map((rect) => ({
    x: rect.x * viewportWidth,
    y: rect.y * viewportHeight,
    width: rect.width * viewportWidth,
    height: rect.height * viewportHeight,
  }))
}

export function legacyPixelRectsToDisplay(rects: AnnotationRect[], zoom: number): AnnotationRect[] {
  const scale = zoom / LEGACY_ANNOTATION_ZOOM
  return rects.map((rect) => ({
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  }))
}

export function toDisplayRects(
  rects: AnnotationRect[],
  viewportWidth: number,
  viewportHeight: number,
  zoom: number
): AnnotationRect[] {
  if (isNormalizedRects(rects)) {
    return denormalizeRects(rects, viewportWidth, viewportHeight)
  }
  return legacyPixelRectsToDisplay(rects, zoom)
}

export function normalizeDrawingPoints(
  points: DrawingPoint[],
  viewportWidth: number,
  viewportHeight: number
): DrawingPoint[] {
  if (viewportWidth <= 0 || viewportHeight <= 0) return points
  return points.map((point) => ({
    x: point.x / viewportWidth,
    y: point.y / viewportHeight,
  }))
}

export function denormalizeDrawingPoints(
  points: DrawingPoint[],
  viewportWidth: number,
  viewportHeight: number
): DrawingPoint[] {
  if (viewportWidth <= 0 || viewportHeight <= 0) return points
  return points.map((point) => ({
    x: point.x * viewportWidth,
    y: point.y * viewportHeight,
  }))
}

export function toDisplayDrawingPoints(
  points: DrawingPoint[],
  viewportWidth: number,
  viewportHeight: number,
  zoom: number
): DrawingPoint[] {
  const looksNormalized = points.every(
    (point) => point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1
  )
  if (looksNormalized) {
    return denormalizeDrawingPoints(points, viewportWidth, viewportHeight)
  }
  const scale = zoom / LEGACY_ANNOTATION_ZOOM
  return points.map((point) => ({
    x: point.x * scale,
    y: point.y * scale,
  }))
}

export function annotationPageNumber(page: number | string): number {
  const parsed = Number(page)
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1
}
