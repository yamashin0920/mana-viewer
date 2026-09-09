import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { fetchCourse, launchContent, syncRoster } from '../api/client'
import { Button } from '../components/Button'
import { useAuthStore } from '../store/authStore'
import type { Course } from '../types'

export function CoursePage() {
  const { courseId = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const canSync = user && user.role !== 'learner'

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const [pageByContent, setPageByContent] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCourse(courseId)
      setCourse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const handleLaunch = async (contentId: string) => {
    setLaunchingId(contentId)
    setError(null)
    try {
      const page = pageByContent[contentId] || 1
      const result = await launchContent({
        contentId,
        page,
        courseId: course?.externalCourseId || courseId,
      })
      const url = new URL(result.launchUrl)
      const token = localStorage.getItem('accessToken')
      if (token) url.searchParams.set('accessToken', token)
      window.location.href = url.toString()
    } catch (err) {
      setError(err instanceof Error ? err.message : '起動に失敗しました')
      setLaunchingId(null)
    }
  }

  const handleSync = async () => {
    if (!course) return
    setSyncMessage(null)
    try {
      const res = await syncRoster(course.externalCourseId || course.id)
      setSyncMessage(`${res.message}（${res.membersAdded} 人）`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '同期に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    )
  }

  if (!course) {
    return <p className="text-sm text-red-600">{error ?? 'コースが見つかりません'}</p>
  }

  return (
    <div className="space-y-6" data-testid="lms-course-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/courses" className="text-xs text-brand-600 hover:underline">
            ← コース一覧
          </Link>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{course.name}</h2>
          <p className="text-sm text-slate-500">ID: {course.externalCourseId}</p>
        </div>
        {canSync && (
          <Button size="sm" variant="secondary" data-testid="lms-roster-sync" onClick={handleSync}>
            名簿を同期
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {syncMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" data-testid="lms-sync-result">
          {syncMessage}
        </div>
      )}

      <section>
        <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">教材（ビューア起動）</h3>
        <div className="space-y-3" data-testid="lms-materials">
          {(course.materials ?? []).map((material) => (
            <div
              key={material.id}
              data-testid={`lms-material-${material.id}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              {material.coverUrl && (
                <img src={material.coverUrl} alt="" className="h-16 w-12 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">{material.title}</p>
                <p className="text-xs text-slate-500">{material.author}</p>
              </div>
              <label className="flex items-center gap-1 text-xs text-slate-500">
                ページ
                <input
                  type="number"
                  min={1}
                  max={material.pageCount}
                  data-testid={`lms-page-${material.id}`}
                  className="w-16 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={pageByContent[material.id] ?? 1}
                  onChange={(e) =>
                    setPageByContent((prev) => ({ ...prev, [material.id]: Number(e.target.value) }))
                  }
                />
              </label>
              <Button
                variant="primary"
                size="sm"
                data-testid={`lms-launch-${material.id}`}
                disabled={launchingId === material.id}
                onClick={() => handleLaunch(material.id)}
              >
                {launchingId === material.id ? '起動中...' : 'ビューアで開く'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">メンバー</h3>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900" data-testid="lms-members">
          {(course.members ?? []).map((member) => (
            <li key={member.id} className="px-4 py-2 text-sm">
              {member.name}
              <span className="ml-2 text-xs text-slate-400">{member.email}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
