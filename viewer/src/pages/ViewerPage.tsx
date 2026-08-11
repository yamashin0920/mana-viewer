import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAnnotation,
  createViewSession,
  deleteAnnotation,
  fetchAnnotations,
  fetchContent,
  fetchContentPolicy,
  fetchProgress,
  getDemoPdfUrl,
  saveProgress,
} from '../api/contents'
import { verifyLicense } from '../api/licenses'
import { cacheContent, queueProgress } from '../db/offline'
import { PdfViewer } from '../components/viewer/PdfViewer'
import { ViewerToolbar } from '../components/viewer/ViewerToolbar'
import { TocSidebar } from '../components/viewer/TocSidebar'
import { AnnotationSidebar } from '../components/viewer/AnnotationSidebar'
import type { Annotation } from '../types'

const USE_DEMO_PDF = import.meta.env.VITE_USE_DEMO_PDF !== 'false'

export function ViewerPage() {
  const { contentId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1.2)
  const [pageCount, setPageCount] = useState(1)
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'annotations'>('toc')
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => fetchContent(contentId),
    enabled: !!contentId,
  })

  const { data: policy } = useQuery({
    queryKey: ['content-policy', contentId],
    queryFn: () => fetchContentPolicy(contentId),
    enabled: !!contentId,
  })

  const { data: license } = useQuery({
    queryKey: ['license-verify', contentId],
    queryFn: () => verifyLicense(contentId),
    enabled: !!contentId,
  })

  const { data: progressData } = useQuery({
    queryKey: ['progress', contentId],
    queryFn: () => fetchProgress(contentId),
    enabled: !!contentId,
  })

  const { data: annotationsData } = useQuery({
    queryKey: ['annotations', contentId],
    queryFn: () => fetchAnnotations(contentId),
    enabled: !!contentId,
  })

  useEffect(() => {
    if (!contentId || !license?.allowed) return
    createViewSession(contentId)
      .then((session) => setSessionToken(session.sessionToken))
      .catch(() => setSessionToken('dev-session'))
  }, [contentId, license?.allowed])

  useEffect(() => {
    if (progressData?.currentPage) {
      setPage(progressData.currentPage)
    }
  }, [progressData?.currentPage])

  useEffect(() => {
    if (content) {
      cacheContent(content).catch(() => undefined)
    }
  }, [content])

  const progressMutation = useMutation({
    mutationFn: (payload: { currentPage: number; progressPercent: number; zoom: number }) =>
      saveProgress(contentId, {
        ...payload,
        viewMode: 'single',
        scrollOffset: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', contentId] })
      queryClient.invalidateQueries({ queryKey: ['contents'] })
    },
    onError: async (_err, payload) => {
      await queueProgress(contentId, payload)
    },
  })

  useEffect(() => {
    if (!contentId || !content) return
    const timer = setTimeout(() => {
      progressMutation.mutate({
        currentPage: page,
        progressPercent: Math.round((page / pageCount) * 1000) / 10,
        zoom,
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [page, pageCount, zoom, contentId, content])

  const addAnnotationMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createAnnotation>[1]) =>
      createAnnotation(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
      setSidebarTab('annotations')
    },
  })

  const deleteAnnotationMutation = useMutation({
    mutationFn: deleteAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
    },
  })

  const handlePageCount = useCallback((count: number) => {
    setPageCount(count)
  }, [])

  const handleTextSelected = useCallback(
    (selection: { text: string; rects: Annotation['rects'] }) => {
      addAnnotationMutation.mutate({
        type: 'highlight',
        page,
        color: '#FFEB3B',
        selectedText: selection.text,
        rects: selection.rects,
      })
    },
    [addAnnotationMutation, page]
  )

  const handleAddBookmark = useCallback(() => {
    addAnnotationMutation.mutate({
      type: 'bookmark',
      page,
      note: `ブックマーク p.${page}`,
    })
  }, [addAnnotationMutation, page])

  const pdfUrl = useMemo(() => {
    if (USE_DEMO_PDF) return getDemoPdfUrl(contentId)
    if (!sessionToken) return ''
    return getDemoPdfUrl(contentId)
  }, [contentId, sessionToken])

  const annotations = annotationsData?.data ?? []
  const toc = content?.toc ?? []

  if (contentLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">読み込み中...</div>
  }

  if (!content) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">教材が見つかりません</div>
  }

  if (license && !license.canView) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-slate-600">
        <p>この教材を閲覧するライセンスがありません</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/')}>
          本棚に戻る
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <ViewerToolbar
        title={content.title}
        page={page}
        pageCount={pageCount}
        zoom={zoom}
        onPageChange={setPage}
        onZoomChange={setZoom}
        onAddBookmark={handleAddBookmark}
        onBack={() => navigate('/')}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:block">
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm ${sidebarTab === 'toc' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
              onClick={() => setSidebarTab('toc')}
            >
              目次
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm ${sidebarTab === 'annotations' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
              onClick={() => setSidebarTab('annotations')}
            >
              注釈 ({annotations.length})
            </button>
          </div>
          {sidebarTab === 'toc' ? (
            <TocSidebar toc={toc} currentPage={page} onJump={setPage} />
          ) : (
            <AnnotationSidebar
              annotations={annotations}
              onJump={setPage}
              onDelete={(id) => deleteAnnotationMutation.mutate(id)}
            />
          )}
        </aside>

        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto flex min-h-full max-w-5xl justify-center">
            {pdfUrl ? (
              <PdfViewer
                pdfUrl={pdfUrl}
                page={page}
                zoom={zoom}
                annotations={annotations}
                watermark={policy?.watermark}
                policy={policy ?? null}
                onPageCount={handlePageCount}
                onTextSelected={handleTextSelected}
              />
            ) : (
              <p className="text-slate-500">閲覧セッションを準備中...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
