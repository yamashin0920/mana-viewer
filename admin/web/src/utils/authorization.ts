import type { User, UserRole } from '../types'

const ADMIN_ROLES: UserRole[] = ['org_admin', 'content_admin']

/** 管理画面へのアクセス権（認可） */
export function canAccessAdmin(user: User): boolean {
  return ADMIN_ROLES.includes(user.role)
}

/**
 * 管理操作の権限。API 側のミドルウェア構成
 * （mock-api/src/routes/admin.js、auth/api/src/routes/admin.js）と対になっている。
 * ここが実態とずれると、押しても 403 で失敗するだけのボタンが表示される。
 */
export type AdminPermission =
  | 'credentials:write'
  | 'users:write'
  | 'licenses:write'
  | 'contents:write'
  | 'contents:delete'

const PERMISSION_ROLES: Record<AdminPermission, UserRole[]> = {
  'credentials:write': ['org_admin'],
  'users:write': ['org_admin'],
  'licenses:write': ['org_admin'],
  'contents:write': ['org_admin', 'content_admin'],
  'contents:delete': ['org_admin'],
}

export function can(user: User | null | undefined, permission: AdminPermission): boolean {
  if (!user) return false
  return PERMISSION_ROLES[permission].includes(user.role)
}

/** 権限が無いことをボタンの title / 説明文で伝えるための文言 */
export function permissionHint(permission: AdminPermission): string {
  const roles = PERMISSION_ROLES[permission]
  return roles.length === 1 && roles[0] === 'org_admin'
    ? 'この操作には組織管理者権限が必要です'
    : 'この操作には管理者権限が必要です'
}
