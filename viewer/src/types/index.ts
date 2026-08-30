export type {
  UserRole,
  User,
  ContentPolicy,
  Progress,
  Content,
  TocEntry,
  BookshelfItem,
  Bookshelf,
  ViewSession,
  ContentPolicyResponse,
  PaginatedResponse,
  LicenseVerifyResult,
} from '@mana/contracts'

export type AnnotationType = 'highlight' | 'bookmark' | 'note' | 'underline' | 'drawing' | 'sticky'

export interface AnnotationRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Annotation {
  id: string
  userId: string
  contentId: string
  type: AnnotationType
  page: number
  color: string | null
  rects: AnnotationRect[] | null
  selectedText: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnotationShareResult {
  shareId: string
  shareUrl: string
  expiresAt: string
  annotationCount: number
  contentTitle: string
}

export interface SharedAnnotationBundle {
  shareId: string
  contentId: string
  contentTitle: string
  sharedBy: { id: string; name: string } | null
  sharedAt: string
  expiresAt: string
  annotations: Annotation[]
}
