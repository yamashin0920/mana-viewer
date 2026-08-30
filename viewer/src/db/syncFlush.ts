import {
  getPendingAnnotations,
  getPendingProgress,
  markAnnotationsSynced,
  markProgressSynced,
  offlineDb,
  queueAnnotationChange,
} from './offline'
import { saveProgress, syncAnnotations } from '../api/contents'
import type { Annotation } from '../types'

async function pendingContentIds(): Promise<string[]> {
  const [progress, annotations] = await Promise.all([
    offlineDb.progressQueue.filter((p) => !p.synced).toArray(),
    offlineDb.annotationQueue.filter((a) => !a.synced).toArray(),
  ])
  return [...new Set([...progress.map((p) => p.contentId), ...annotations.map((a) => a.contentId)])]
}

async function flushProgressFor(contentId: string) {
  const pending = await getPendingProgress(contentId)
  if (pending.length === 0) return

  // 同一教材は最新ペイロードだけ送る
  const latest = pending[pending.length - 1]
  await saveProgress(contentId, { ...latest.payload, scrollOffset: latest.payload.scrollOffset ?? 0 })
  const ids = pending.map((p) => p.id).filter((id): id is number => typeof id === 'number')
  await markProgressSynced(ids)
}

async function flushAnnotationsFor(contentId: string) {
  const pending = await getPendingAnnotations(contentId)
  if (pending.length === 0) return

  const deletedIds = pending.filter((p) => p.action === 'delete').map((p) => p.annotationId)
  const items = pending
    .filter((p) => p.action !== 'delete' && p.payload)
    .map((p) => ({ id: p.annotationId, ...p.payload }) as Partial<Annotation>)

  await syncAnnotations(contentId, { items, deletedIds })
  const ids = pending.map((p) => p.id).filter((id): id is number => typeof id === 'number')
  await markAnnotationsSynced(ids)
}

/** 保留中の進捗・注釈をサーバへ送る */
export async function flushOfflineQueues(): Promise<{ contentIds: string[] }> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { contentIds: [] }
  }

  const contentIds = await pendingContentIds()
  for (const contentId of contentIds) {
    await flushProgressFor(contentId)
    await flushAnnotationsFor(contentId)
  }
  return { contentIds }
}

export async function queueFailedAnnotation(
  contentId: string,
  action: 'create' | 'update' | 'delete',
  annotationId: string,
  payload?: Partial<Annotation>,
) {
  await queueAnnotationChange({ contentId, action, annotationId, payload })
}
