import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { can, type AdminPermission } from '../utils/authorization'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  return useCallback((permission: AdminPermission) => can(user, permission), [user])
}
