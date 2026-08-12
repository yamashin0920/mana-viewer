import Dexie, { type EntityTable } from 'dexie'
import type { Annotation, Content, Progress } from '../types'

interface CachedContent {
  id: string
  data: Content
  cachedAt: string
}

interface ProgressQueueItem {
  id?: number
  contentId: string
  payload: Partial<Progress>
  updatedAt: string
  synced: boolean
}

interface AnnotationQueueItem {
  id?: number
  contentId: string
  annotationId: string
  action: 'create' | 'update' | 'delete'
  payload?: Partial<Annotation>
  updatedAt: string
  synced: boolean
}

interface OfflinePackageRecord {
  contentId: string
  downloadUrl: string
  expiresAt: string
  cachedAt: string
}

class ManabuOfflineDB extends Dexie {
  contents!: EntityTable<CachedContent, 'id'>
  progressQueue!: EntityTable<ProgressQueueItem, 'id'>
  annotationQueue!: EntityTable<AnnotationQueueItem, 'id'>
  offlinePackages!: EntityTable<OfflinePackageRecord, 'contentId'>

  constructor() {
    super('mana-viewer-offline')
    this.version(1).stores({
      contents: 'id, cachedAt',
      progressQueue: '++id, contentId, synced, updatedAt',
      annotationQueue: '++id, contentId, synced, updatedAt',
      offlinePackages: 'contentId, expiresAt',
    })
  }
}

export const offlineDb = new ManabuOfflineDB()

export async function cacheContent(content: Content) {
  await offlineDb.contents.put({
    id: content.id,
    data: content,
    cachedAt: new Date().toISOString(),
  })
}

export async function getCachedContent(contentId: string) {
  const row = await offlineDb.contents.get(contentId)
  return row?.data ?? null
}

export async function queueProgress(contentId: string, payload: Partial<Progress>) {
  await offlineDb.progressQueue.add({
    contentId,
    payload,
    updatedAt: new Date().toISOString(),
    synced: false,
  })
}

export async function getPendingProgress(contentId: string) {
  return offlineDb.progressQueue
    .where({ contentId, synced: false })
    .sortBy('updatedAt')
}

export async function markProgressSynced(ids: number[]) {
  await offlineDb.progressQueue.where('id').anyOf(ids).modify({ synced: true })
}

export async function queueAnnotationChange(item: Omit<AnnotationQueueItem, 'id' | 'synced' | 'updatedAt'>) {
  await offlineDb.annotationQueue.add({
    ...item,
    updatedAt: new Date().toISOString(),
    synced: false,
  })
}

export async function getPendingAnnotations(contentId: string) {
  return offlineDb.annotationQueue
    .where({ contentId, synced: false })
    .sortBy('updatedAt')
}

export async function markAnnotationsSynced(ids: number[]) {
  await offlineDb.annotationQueue.where('id').anyOf(ids).modify({ synced: true })
}
