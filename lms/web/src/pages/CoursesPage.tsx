import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Loader2 } from 'lucide-react'
import { fetchCourses } from '../api/client'
import type { Course } from '../types'

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchCourses()
      setCourses(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="lms-courses-page">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">コース</h2>
        <p className="text-sm text-slate-500">コースの教材をマナビューアで開きます（LTI / Deep Link）</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2" data-testid="lms-course-list">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.externalCourseId || course.id}`}
            data-testid={`lms-course-${course.externalCourseId || course.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{course.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              教材 {course.materialCount} 冊 · メンバー {course.memberCount} 人
            </p>
          </Link>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-sm text-slate-500" data-testid="lms-courses-empty">
          参加中のコースはありません
        </p>
      )}
    </div>
  )
}
