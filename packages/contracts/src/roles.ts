export type UserRole = 'learner' | 'instructor' | 'org_admin' | 'content_admin'

export const USER_ROLES: UserRole[] = ['learner', 'instructor', 'org_admin', 'content_admin']

export const ADMIN_ROLES: UserRole[] = ['org_admin', 'content_admin']

export function isAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === 'org_admin' || role === 'content_admin'
}

export function isOrgAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === 'org_admin'
}
