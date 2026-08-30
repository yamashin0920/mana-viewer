import { isAdminRole, isOrgAdminRole, type UserRole } from './roles'

/**
 * 管理操作の権限。
 * mock-api / auth-api のミドルウェアと admin UI の表示制御が同じ表を参照する。
 */
export type AdminPermission =
  | 'credentials:write'
  | 'users:write'
  | 'licenses:write'
  | 'contents:write'
  | 'contents:delete'

export const PERMISSION_ROLES: Record<AdminPermission, UserRole[]> = {
  'credentials:write': ['org_admin'],
  'users:write': ['org_admin'],
  'licenses:write': ['org_admin'],
  'contents:write': ['org_admin', 'content_admin'],
  'contents:delete': ['org_admin'],
}

export interface RoleBearer {
  role: UserRole
}

export function canAccessAdmin(user: RoleBearer | null | undefined): boolean {
  return !!user && isAdminRole(user.role)
}

export function can(
  user: RoleBearer | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!user) return false
  return PERMISSION_ROLES[permission].includes(user.role)
}

export function permissionHint(permission: AdminPermission): string {
  const roles = PERMISSION_ROLES[permission]
  return roles.length === 1 && roles[0] === 'org_admin'
    ? 'この操作には組織管理者権限が必要です'
    : 'この操作には管理者権限が必要です'
}

export function canPermissionRole(
  role: UserRole | string | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role) return false
  return PERMISSION_ROLES[permission].includes(role as UserRole)
}

export { isAdminRole, isOrgAdminRole }
