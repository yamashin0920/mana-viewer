import { useQuery } from '@tanstack/react-query'
import { fetchAdminUsers, fetchContents, fetchCredentials, fetchLicenses } from '../api/client'

export const adminQueryKeys = {
  users: ['admin', 'users'] as const,
  licenses: ['admin', 'licenses'] as const,
  contents: ['admin', 'contents'] as const,
  credentials: ['admin', 'credentials'] as const,
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: fetchAdminUsers,
  })
}

export function useAdminLicensesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.licenses,
    queryFn: fetchLicenses,
  })
}

export function useAdminContentsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.contents,
    queryFn: fetchContents,
  })
}

export function useAdminCredentialsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.credentials,
    queryFn: fetchCredentials,
  })
}
