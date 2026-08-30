import type { UserRole } from './roles'

export interface User {
  id: string
  orgId: string
  email: string
  name: string
  role: UserRole
  externalId?: string | null
  avatarUrl?: string | null
  organization?: {
    id: string
    name: string
    branding?: { logoUrl?: string; displayName?: string }
  } | null
}

export interface ContentPolicy {
  allowPrint: boolean
  allowOffline: boolean
  offlineDays: number
  maxDevices: number
  watermarkText?: string
}

export interface Progress {
  userId?: string
  contentId?: string
  currentPage: number
  progressPercent: number
  scrollOffset: number
  zoom: number
  viewMode: string
  lastReadAt: string | null
  totalReadSeconds: number
}

export interface TocEntry {
  title: string
  page: number
  level: number
  url?: string | null
}

export interface Content {
  id: string
  orgId: string
  title: string
  coverTitle?: string
  author: string
  isbn?: string
  description?: string
  coverUrl?: string
  pageCount: number
  fileSizeBytes?: number
  category?: string
  tags?: string[]
  version?: string
  status?: string
  policy: ContentPolicy
  progress?: Progress | null
  toc?: TocEntry[]
}

export interface UserLicense {
  id: string
  contentId: string
  contentTitle?: string
  expiresAt: string
  status: string
  valid?: boolean
}

export interface AdminUser extends User {
  licenses?: UserLicense[]
}

export interface CredentialAccount {
  loginId: string
  token: string
  linkedUserId: string
  linkedUser: User | null
}

export interface License {
  id: string
  orgId: string
  contentId: string
  seatCount: number
  assignedUserIds: string[]
  startsAt: string
  expiresAt: string
  allowOffline: boolean
  status: string
  content?: Content
  assignedUsers?: User[]
  seatsUsed?: number
  seatsAvailable?: number
}

export interface BookshelfItem {
  shelfId: string
  contentId: string
  sortOrder: number
  content: Content
}

export interface Bookshelf {
  id: string
  orgId: string
  userId: string | null
  name: string
  type: 'distributed' | 'recent' | 'favorites' | 'custom'
  sortOrder: number
  items: BookshelfItem[]
}

export interface ViewSession {
  id: string
  contentId: string
  userId: string
  sessionToken: string
  expiresAt: string
  watermark: string | null
  pageCount: number
}

export interface ContentPolicyResponse extends ContentPolicy {
  contentId: string
  watermark: string | null
  drm: {
    encrypted: boolean
    algorithm: string
    streamingOnly: boolean
    allowScreenshot: boolean
    allowCopy: boolean
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LicenseVerifyResult {
  allowed: boolean
  canView: boolean
  canDownloadOffline: boolean
  expiresAt?: string
  offlineDays?: number
  maxDevices?: number
  reason?: string | null
}
