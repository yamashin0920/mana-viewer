import type { UserRole } from './roles'

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
