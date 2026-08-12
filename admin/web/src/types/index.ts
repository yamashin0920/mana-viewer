export type UserRole = 'learner' | 'instructor' | 'org_admin' | 'content_admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  orgId?: string
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

export interface ContentPolicy {
  allowPrint: boolean
  allowOffline: boolean
  offlineDays: number
  maxDevices: number
  watermarkText?: string
}

export interface Content {
  id: string
  orgId: string
  title: string
  author: string
  isbn?: string
  description?: string
  coverUrl?: string
  pageCount: number
  category?: string
  tags?: string[]
  version?: string
  status?: string
  policy: ContentPolicy
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

export const ROLE_LABELS: Record<UserRole, string> = {
  learner: '学習者',
  instructor: '講師',
  org_admin: '組織管理者',
  content_admin: 'コンテンツ管理者',
}

export const STATUS_LABELS: Record<string, string> = {
  published: '公開',
  draft: '下書き',
  archived: 'アーカイブ',
  active: '有効',
  expired: '期限切れ',
  revoked: '無効',
}
