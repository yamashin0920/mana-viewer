import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { buildRedirectUrl } from '../api/client'
import { persistAccessToken } from '../session'

/**
 * 開発専用: ビューアのユーザー切替時に auth セッションと viewer トークンを同期する
 */
export function DevSyncPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect')

    if (!token || !redirect) {
      window.location.replace('/login')
      return
    }

    try {
      persistAccessToken(token)
      window.location.replace(buildRedirectUrl(decodeURIComponent(redirect), token))
    } catch {
      window.location.replace('/login')
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  )
}
