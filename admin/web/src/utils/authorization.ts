import type { User, UserRole } from '../types'

const ADMIN_ROLES: UserRole[] = ['org_admin', 'content_admin']

/** 管理画面へのアクセス権（認可） */
export function canAccessAdmin(user: User): boolean {
  return ADMIN_ROLES.includes(user.role)
}
