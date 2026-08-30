/**
 * Node (CommonJS) 向けの権限定義。
 * TypeScript の src/permissions.ts / src/roles.ts と内容を同期すること。
 */

const USER_ROLES = ['learner', 'instructor', 'org_admin', 'content_admin']
const ADMIN_ROLES = ['org_admin', 'content_admin']

const PERMISSION_ROLES = {
  'credentials:write': ['org_admin'],
  'users:write': ['org_admin'],
  'licenses:write': ['org_admin'],
  'contents:write': ['org_admin', 'content_admin'],
  'contents:delete': ['org_admin'],
}

function isAdminRole(role) {
  return role === 'org_admin' || role === 'content_admin'
}

function isOrgAdminRole(role) {
  return role === 'org_admin'
}

function canAccessAdmin(user) {
  return !!(user && isAdminRole(user.role))
}

function can(user, permission) {
  if (!user) return false
  const roles = PERMISSION_ROLES[permission]
  return Array.isArray(roles) && roles.includes(user.role)
}

function canPermissionRole(role, permission) {
  if (!role) return false
  const roles = PERMISSION_ROLES[permission]
  return Array.isArray(roles) && roles.includes(role)
}

module.exports = {
  USER_ROLES,
  ADMIN_ROLES,
  PERMISSION_ROLES,
  isAdminRole,
  isOrgAdminRole,
  canAccessAdmin,
  can,
  canPermissionRole,
}
