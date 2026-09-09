export type UserRole = 'learner' | 'instructor' | 'org_admin' | 'content_admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  orgId?: string
}

export interface CourseMaterial {
  id: string
  title: string
  author: string
  pageCount: number
  coverUrl?: string
  category?: string
}

export interface CourseMember {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Course {
  id: string
  name: string
  externalCourseId: string | null
  memberIds: string[]
  memberCount: number
  materialCount: number
  members?: CourseMember[]
  materials?: CourseMaterial[]
}

export interface LaunchResult {
  launchUrl: string
  content: { id: string; title: string; pageCount?: number }
  courseId: string | null
  page: number
}

export interface XapiRecord {
  id: string
  userId: string
  receivedAt: string
  statement: {
    actor?: { name?: string }
    verb?: string
    object?: { id?: string; definition?: { name?: { 'ja-JP'?: string } } }
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  learner: '学習者',
  instructor: '講師',
  org_admin: '組織管理者',
  content_admin: 'コンテンツ管理者',
}
