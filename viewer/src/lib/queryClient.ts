import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

/** ユーザー切替時にユーザー依存の API キャッシュを破棄する */
export function resetUserQueries() {
  queryClient.removeQueries({ queryKey: ['contents'] })
  queryClient.removeQueries({ queryKey: ['bookshelves'] })
}
