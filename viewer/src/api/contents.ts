import { apiFetch } from './client'
import type {
  Annotation,
  AnnotationShareResult,
  Content,
  ContentPolicyResponse,
  PaginatedResponse,
  Progress,
  SharedAnnotationBundle,
  ViewSession,
} from '../types'

export async function fetchContents(params?: {
  q?: string
  category?: string
}) {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.category) search.set('category', params.category)
  const qs = search.toString()
  return apiFetch<PaginatedResponse<Content>>(`/contents${qs ? `?${qs}` : ''}`)
}

export async function fetchContent(contentId: string) {
  return apiFetch<Content>(`/contents/${contentId}`)
}

export async function fetchContentPolicy(contentId: string) {
  return apiFetch<ContentPolicyResponse>(`/contents/${contentId}/policy`)
}

export async function createViewSession(contentId: string) {
  return apiFetch<ViewSession>(`/contents/${contentId}/view-sessions`, {
    method: 'POST',
  })
}

export async function fetchProgress(contentId: string) {
  return apiFetch<Progress>(`/contents/${contentId}/progress`)
}

export async function saveProgress(contentId: string, progress: Partial<Progress>) {
  return apiFetch<Progress>(`/contents/${contentId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(progress),
  })
}

export async function fetchAnnotations(contentId: string) {
  return apiFetch<{ data: Annotation[] }>(`/contents/${contentId}/annotations`)
}

export async function createAnnotation(
  contentId: string,
  payload: {
    type: Annotation['type']
    page: number
    color?: string | null
    rects?: Annotation['rects']
    selectedText?: string | null
    note?: string | null
  }
) {
  return apiFetch<Annotation>(`/contents/${contentId}/annotations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteAnnotation(annotationId: string) {
  return apiFetch<void>(`/annotations/${annotationId}`, { method: 'DELETE' })
}

export async function updateAnnotation(
  annotationId: string,
  payload: {
    color?: string | null
    note?: string | null
    selectedText?: string | null
    page?: number
  }
) {
  return apiFetch<Annotation>(`/annotations/${annotationId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function syncAnnotations(
  contentId: string,
  payload: {
    items?: Partial<Annotation>[]
    deletedIds?: string[]
  }
) {
  return apiFetch<{ synced: Annotation[]; serverAnnotations: Annotation[] }>(
    `/contents/${contentId}/annotations/sync`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export async function shareAnnotations(
  contentId: string,
  payload?: { annotationIds?: string[]; expiresInDays?: number }
) {
  return apiFetch<AnnotationShareResult>(`/contents/${contentId}/annotations/share`, {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  })
}

export async function fetchSharedAnnotations(shareId: string) {
  return apiFetch<SharedAnnotationBundle>(`/annotations/shared/${shareId}`)
}

export function getDemoPdfUrl(contentId: string) {
  void contentId
  return '/sample.pdf'
}
