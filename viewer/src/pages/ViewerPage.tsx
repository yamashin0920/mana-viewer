import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookX, Loader2 } from 'lucide-react'
import {
  createAnnotation,
  createViewSession,
  deleteAnnotation,
  fetchAnnotations,
  fetchContent,
  fetchContentPolicy,
  fetchProgress,
  fetchSharedAnnotations,
  getDemoPdfUrl,
  saveProgress,
  shareAnnotations,
  updateAnnotation,
} from '../api/contents'
import { verifyLicense } from '../api/licenses'
import { cacheContent, queueProgress } from '../db/offline'
import { PdfViewer, type TextSelection, type ViewMode } from '../components/viewer/PdfViewer'
import { ViewerToolbar, ViewerSidebarToggle } from '../components/viewer/ViewerToolbar'
import { ViewerSidebar, MobileSidebarDrawer } from '../components/viewer/ViewerSidebar'
import { SelectionToolbar } from '../components/viewer/SelectionToolbar'
import { NoteDialog } from '../components/viewer/NoteDialog'
import { EditAnnotationDialog } from '../components/viewer/EditAnnotationDialog'
import { StickyNoteDialog } from '../components/viewer/StickyNoteDialog'
import { ShareAnnotationsDialog } from '../components/viewer/ShareAnnotationsDialog'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { toast } from '../components/ui/Toast'
import { DEFAULT_HIGHLIGHT_COLOR } from '../constants/highlightColors'
import {
  useKeyboardNavigation,
  spreadPageStep,
  singlePageStep,
} from '../hooks/useKeyboardNavigation'
import { usePdfDocument } from '../hooks/usePdfDocument'
import { usePdfTextSearch } from '../hooks/usePdfTextSearch'
import { usePdfOutline } from '../hooks/usePdfOutline'
import { DEFAULT_PEN_COLOR } from '../constants/penColors'
import type { Annotation } from '../types'
import type { AnnotationTool } from '../types/annotationTools'
import {
  loadAnnotationVisibility,
  saveAnnotationVisibility,
  type AnnotationVisibility,
} from '../types/annotationVisibility'
import { getDrawingBoundingBox, serializeDrawingPath, type DrawingPoint } from '../utils/drawingPath'
import { exportAnnotations } from '../utils/annotationExport'

const USE_DEMO_PDF = import.meta.env.VITE_USE_DEMO_PDF !== 'false'
const SHOW_ANNOTATIONS_KEY = 'viewer-show-annotations'

function loadShowAnnotations() {
  try {
    return localStorage.getItem(SHOW_ANNOTATIONS_KEY) !== 'false'
  } catch {
    return true
  }
}

export function ViewerPage() {
  const { contentId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const shareId = searchParams.get('share')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1.2)
  const [pageCount, setPageCount] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'toc' | 'annotations'>('thumbnails')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [pendingSelection, setPendingSelection] = useState<TextSelection | null>(null)
  const [highlightColor, setHighlightColor] = useState<string>(DEFAULT_HIGHLIGHT_COLOR)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteMode, setNoteMode] = useState<'page' | 'selection'>('page')
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editColor, setEditColor] = useState<string>(DEFAULT_HIGHLIGHT_COLOR)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1)
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('select')
  const [penColor, setPenColor] = useState<string>(DEFAULT_PEN_COLOR)
  const [stickyDialogOpen, setStickyDialogOpen] = useState(false)
  const [stickyText, setStickyText] = useState('')
  const [stickyPosition, setStickyPosition] = useState<{ page: number; x: number; y: number } | null>(
    null
  )
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null)
  const [shareAnnotationCount, setShareAnnotationCount] = useState(0)
  const [showAnnotations, setShowAnnotations] = useState(loadShowAnnotations)
  const [annotationVisibility, setAnnotationVisibility] = useState(loadAnnotationVisibility)

  const totalPages = pageCount

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

  const { data: progressData, isSuccess: progressLoaded } = useQuery({
    queryKey: ['progress', contentId],
    queryFn: () => fetchProgress(contentId),
    enabled: !!contentId,
  })

  const [progressHydrated, setProgressHydrated] = useState(false)
  const restoredContentIdRef = useRef<string | null>(null)
  const pageRef = useRef(page)
  const zoomRef = useRef(zoom)
  const viewModeRef = useRef(viewMode)
  pageRef.current = page
  zoomRef.current = zoom
  viewModeRef.current = viewMode

  const { data: annotationsData } = useQuery({
    queryKey: ['annotations', contentId],
    queryFn: () => fetchAnnotations(contentId),
    enabled: !!contentId,
  })

  const { data: sharedBundle, error: sharedError } = useQuery({
    queryKey: ['shared-annotations', shareId],
    queryFn: () => fetchSharedAnnotations(shareId!),
    enabled: !!shareId,
    retry: false,
  })

  useEffect(() => {
    if (!contentId || !license?.allowed) return
    createViewSession(contentId)
      .then((session) => setSessionToken(session.sessionToken))
      .catch(() => setSessionToken('dev-session'))
  }, [contentId, license?.allowed])

  useEffect(() => {
    setProgressHydrated(false)
    restoredContentIdRef.current = null
  }, [contentId])

  useEffect(() => {
    if (!contentId || !progressLoaded || !progressData) return
    if (restoredContentIdRef.current === contentId) return

    if (progressData.currentPage > 0) {
      setPage(progressData.currentPage)
    }
    if (progressData.viewMode === 'spread' || progressData.viewMode === 'single') {
      setViewMode(progressData.viewMode as ViewMode)
    }
    if (progressData.zoom) {
      setZoom(progressData.zoom)
    }
    restoredContentIdRef.current = contentId
    setProgressHydrated(true)
  }, [contentId, progressLoaded, progressData])

  useEffect(() => {
    if (content) {
      cacheContent(content).catch(() => undefined)
    }
  }, [content])

  const progressMutation = useMutation({
    mutationFn: (payload: {
      currentPage: number
      progressPercent: number
      zoom: number
      viewMode: ViewMode
    }) =>
      saveProgress(contentId, {
        ...payload,
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
    if (!contentId || !content || !progressHydrated) return
    const timer = setTimeout(() => {
      const total = content.pageCount || pageCount
      progressMutation.mutate({
        currentPage: page,
        progressPercent: Math.min(100, Math.round((page / total) * 1000) / 10),
        zoom,
        viewMode,
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [page, pageCount, zoom, viewMode, contentId, content, progressHydrated])

  useEffect(() => {
    if (!contentId || !content) return

    const flushProgress = () => {
      if (!progressHydrated) return
      const total = content.pageCount || pageCount
      const payload = {
        currentPage: pageRef.current,
        progressPercent: Math.min(
          100,
          Math.round((pageRef.current / total) * 1000) / 10
        ),
        zoom: zoomRef.current,
        viewMode: viewModeRef.current,
      }
      saveProgress(contentId, { ...payload, scrollOffset: 0 }).catch(() => undefined)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushProgress()
    }

    window.addEventListener('beforeunload', flushProgress)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', flushProgress)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      flushProgress()
    }
  }, [contentId, content, pageCount, progressHydrated])

  const addAnnotationMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createAnnotation>[1]) =>
      createAnnotation(contentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
      setSidebarTab('annotations')
      setPendingSelection(null)
      setNoteDialogOpen(false)
      setNoteText('')
      const labels = {
        highlight: 'マーカー',
        bookmark: 'ブックマーク',
        note: 'メモ',
        underline: '下線',
        drawing: '描画',
        sticky: '付箋',
      }
      toast(`${labels[variables.type]}を追加しました`)
    },
    onError: () => toast('注釈の保存に失敗しました', 'error'),
  })

  const updateAnnotationMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAnnotation>[1] }) =>
      updateAnnotation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
      setEditingAnnotation(null)
      toast('注釈を更新しました')
    },
    onError: () => toast('更新に失敗しました', 'error'),
  })

  const deleteAnnotationMutation = useMutation({
    mutationFn: deleteAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
      toast('注釈を削除しました')
    },
    onError: () => toast('削除に失敗しました', 'error'),
  })

  const shareAnnotationsMutation = useMutation({
    mutationFn: () => shareAnnotations(contentId),
    onSuccess: (data) => {
      const absoluteUrl = `${window.location.origin}${data.shareUrl}`
      setShareUrl(absoluteUrl)
      setShareExpiresAt(data.expiresAt)
      setShareAnnotationCount(data.annotationCount)
      setShareDialogOpen(true)
      toast('共有リンクを作成しました')
    },
    onError: () => toast('共有リンクの作成に失敗しました', 'error'),
  })

  useEffect(() => {
    if (annotationTool !== 'select') {
      setPendingSelection(null)
    }
  }, [annotationTool])

  const handlePageCount = useCallback((count: number) => {
    setPageCount(count)
  }, [])

  const handlePrev = useCallback(() => {
    setPage((p) =>
      viewMode === 'spread' ? spreadPageStep(p, 'prev', totalPages) : singlePageStep(p, 'prev', totalPages)
    )
  }, [viewMode, totalPages])

  const handleNext = useCallback(() => {
    setPage((p) =>
      viewMode === 'spread' ? spreadPageStep(p, 'next', totalPages) : singlePageStep(p, 'next', totalPages)
    )
  }, [viewMode, totalPages])

  useKeyboardNavigation({ onPrev: handlePrev, onNext: handleNext })

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'spread') {
      setPage((p) => (p % 2 === 0 ? Math.max(1, p - 1) : p))
    }
  }, [])

  const handleSelection = useCallback(
    (selection: TextSelection) => {
      if (annotationTool === 'marker') {
        addAnnotationMutation.mutate({
          type: 'highlight',
          page: selection.page,
          color: highlightColor,
          selectedText: selection.text,
          rects: selection.rects,
        })
        return
      }
      setPendingSelection(selection)
    },
    [annotationTool, addAnnotationMutation, highlightColor]
  )

  const handleClearSelection = useCallback(() => {
    setPendingSelection(null)
  }, [])

  const handleHighlight = useCallback(() => {
    if (!pendingSelection) return
    addAnnotationMutation.mutate({
      type: 'highlight',
      page: pendingSelection.page,
      color: highlightColor,
      selectedText: pendingSelection.text,
      rects: pendingSelection.rects,
    })
  }, [addAnnotationMutation, pendingSelection, highlightColor])

  const handleOpenNoteFromSelection = useCallback(() => {
    setNoteMode('selection')
    setNoteDialogOpen(true)
  }, [])

  const handleOpenPageNote = useCallback(() => {
    setNoteMode('page')
    setNoteText('')
    setNoteDialogOpen(true)
  }, [])

  const handleSaveNote = useCallback(() => {
    if (!noteText.trim()) return
    if (noteMode === 'selection' && pendingSelection) {
      addAnnotationMutation.mutate({
        type: 'note',
        page: pendingSelection.page,
        color: '#FF9800',
        selectedText: pendingSelection.text,
        rects: pendingSelection.rects,
        note: noteText.trim(),
      })
    } else {
      addAnnotationMutation.mutate({
        type: 'note',
        page,
        color: '#FF9800',
        rects: [{ x: 20, y: 20, width: 24, height: 24 }],
        note: noteText.trim(),
      })
    }
  }, [addAnnotationMutation, noteMode, pendingSelection, page, noteText])

  const handleAddBookmark = useCallback(() => {
    addAnnotationMutation.mutate({
      type: 'bookmark',
      page,
      note: `p.${page} ブックマーク`,
    })
  }, [addAnnotationMutation, page])

  const handleEditAnnotation = useCallback((ann: Annotation) => {
    setEditingAnnotation(ann)
    setEditNote(ann.note ?? '')
    setEditColor(ann.color ?? DEFAULT_HIGHLIGHT_COLOR)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingAnnotation) return
    updateAnnotationMutation.mutate({
      id: editingAnnotation.id,
      payload: {
        note: editNote.trim() || null,
        color:
          editingAnnotation.type === 'highlight' || editingAnnotation.type === 'drawing'
            ? editColor
            : editingAnnotation.color,
      },
    })
  }, [updateAnnotationMutation, editingAnnotation, editNote, editColor])

  const handleDrawingComplete = useCallback(
    (points: DrawingPoint[]) => {
      if (points.length < 2) return
      addAnnotationMutation.mutate({
        type: 'drawing',
        page,
        color: penColor,
        rects: [getDrawingBoundingBox(points)],
        note: serializeDrawingPath(points),
      })
    },
    [addAnnotationMutation, page, penColor]
  )

  const handleStickyPlace = useCallback(
    (position: { x: number; y: number }) => {
      setStickyPosition({ page, ...position })
      setStickyText('')
      setStickyDialogOpen(true)
    },
    [page]
  )

  const handleSaveSticky = useCallback(() => {
    if (!stickyPosition || !stickyText.trim()) return
    addAnnotationMutation.mutate({
      type: 'sticky',
      page: stickyPosition.page,
      color: '#FFEB3B',
      rects: [{ x: stickyPosition.x, y: stickyPosition.y, width: 112, height: 96 }],
      note: stickyText.trim(),
    })
    setStickyDialogOpen(false)
    setStickyPosition(null)
    setStickyText('')
    setAnnotationTool('select')
  }, [addAnnotationMutation, stickyPosition, stickyText])

  const ownAnnotations = annotationsData?.data ?? []

  const { sharedAnnotationIds, displayAnnotations } = useMemo(() => {
    const sharedList = sharedBundle?.annotations ?? []
    if (sharedList.length === 0) {
      return {
        sharedAnnotationIds: new Set<string>(),
        displayAnnotations: ownAnnotations,
      }
    }
    const ownIds = new Set(ownAnnotations.map((a) => a.id))
    const sharedOnly = sharedList.filter((a) => !ownIds.has(a.id))
    return {
      sharedAnnotationIds: new Set(sharedOnly.map((a) => a.id)),
      displayAnnotations: [...ownAnnotations, ...sharedOnly],
    }
  }, [ownAnnotations, sharedBundle])

  const handleExportAnnotations = useCallback(
    (format: 'json' | 'markdown') => {
      if (!content) return
      exportAnnotations(ownAnnotations, {
        contentId,
        contentTitle: content.title,
      }, format)
      toast(format === 'json' ? 'JSON をエクスポートしました' : 'Markdown をエクスポートしました')
    },
    [content, contentId, ownAnnotations]
  )

  const handleShareAnnotations = useCallback(() => {
    shareAnnotationsMutation.mutate()
  }, [shareAnnotationsMutation])

  const handleShowAnnotationsChange = useCallback((show: boolean) => {
    setShowAnnotations(show)
    try {
      localStorage.setItem(SHOW_ANNOTATIONS_KEY, String(show))
    } catch {
      /* ignore */
    }
  }, [])

  const handleAnnotationVisibilityChange = useCallback((visibility: AnnotationVisibility) => {
    setAnnotationVisibility(visibility)
    saveAnnotationVisibility(visibility)
  }, [])

  const pdfUrl = useMemo(() => {
    if (USE_DEMO_PDF) return getDemoPdfUrl(contentId)
    if (!sessionToken) return ''
    return getDemoPdfUrl(contentId)
  }, [contentId, sessionToken])

  const { pdfDoc, loading: pdfLoading, error: pdfError, numPages: pdfNumPages } = usePdfDocument(
    pdfUrl || null
  )

  const { matches: searchMatches, searching: searchSearching } = usePdfTextSearch(
    pdfDoc,
    searchQuery,
    zoom
  )

  const { outlineToc } = usePdfOutline(pdfDoc)

  useEffect(() => {
    if (pdfNumPages > 0) {
      setPageCount(pdfNumPages)
      setPage((current) => Math.min(Math.max(1, current), pdfNumPages))
    }
  }, [pdfNumPages])

  useEffect(() => {
    if (!searchQuery.trim() || searchSearching) return
    if (searchMatches.length === 0) {
      setActiveSearchIndex(-1)
      return
    }
    setActiveSearchIndex(0)
    setPage(searchMatches[0].page)
  }, [searchQuery, searchMatches, searchSearching])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchOpen])

  useEffect(() => {
    if (sharedBundle && shareId) {
      setSidebarTab('annotations')
    }
  }, [sharedBundle, shareId])

  useEffect(() => {
    if (!sharedError || !shareId) return
    toast('共有された注釈を読み込めませんでした', 'error')
  }, [sharedError, shareId])

  useEffect(() => {
    if (!sharedBundle || !contentId) return
    if (sharedBundle.contentId !== contentId) {
      toast('共有リンクの教材 ID が一致しません', 'error')
    }
  }, [sharedBundle, contentId])

  const handleSearchPrev = useCallback(() => {
    if (searchMatches.length === 0) return
    setActiveSearchIndex((current) => {
      const nextIndex = current <= 0 ? searchMatches.length - 1 : current - 1
      setPage(searchMatches[nextIndex].page)
      return nextIndex
    })
  }, [searchMatches])

  const handleSearchNext = useCallback(() => {
    if (searchMatches.length === 0) return
    setActiveSearchIndex((current) => {
      const nextIndex = current >= searchMatches.length - 1 ? 0 : current + 1
      setPage(searchMatches[nextIndex].page)
      return nextIndex
    })
  }, [searchMatches])

  const apiToc = content?.toc ?? []
  const mergedToc = useMemo(() => {
    if (apiToc.length > 0) return apiToc
    return outlineToc
  }, [apiToc, outlineToc])
  const displayPageCount = pdfNumPages || content?.pageCount || pageCount

  if (contentLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        教材を読み込み中...
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
        <EmptyState
          icon={<BookX className="h-12 w-12" />}
          title="教材が見つかりません"
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              本棚に戻る
            </Button>
          }
        />
      </div>
    )
  }

  if (license && !license.canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
        <EmptyState
          icon={<BookX className="h-12 w-12" />}
          title="ライセンスがありません"
          description="この教材を閲覧する権限がありません。管理者にお問い合わせください。"
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              本棚に戻る
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-200/70 dark:bg-slate-950" data-testid="viewer-page">
      {sharedBundle && sharedBundle.annotations.length > 0 && (
        <div
          className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-center text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
          data-testid="shared-annotations-banner"
        >
          {sharedBundle.sharedBy?.name ?? '他のユーザー'} が共有した注釈を表示中（
          {sharedBundle.annotations.length} 件）
        </div>
      )}
      <ViewerToolbar
        title={content.title}
        page={page}
        pageCount={content.pageCount || pageCount}
        zoom={zoom}
        viewMode={viewMode}
        saving={progressMutation.isPending}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        searchMatchCount={searchMatches.length}
        activeSearchIndex={activeSearchIndex}
        searchSearching={searchSearching}
        onSearchOpenChange={setSearchOpen}
        onSearchQueryChange={setSearchQuery}
        onSearchPrev={handleSearchPrev}
        onSearchNext={handleSearchNext}
        annotationTool={annotationTool}
        penColor={penColor}
        markerColor={highlightColor}
        onAnnotationToolChange={setAnnotationTool}
        onPenColorChange={setPenColor}
        onMarkerColorChange={setHighlightColor}
        showAnnotations={showAnnotations}
        annotationVisibility={annotationVisibility}
        onShowAnnotationsChange={handleShowAnnotationsChange}
        onAnnotationVisibilityChange={handleAnnotationVisibilityChange}
        onPageChange={setPage}
        onZoomChange={setZoom}
        onViewModeChange={handleViewModeChange}
        onAddBookmark={handleAddBookmark}
        onAddNote={handleOpenPageNote}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
        onBack={() => navigate('/')}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 shrink-0 lg:block" data-testid="desktop-sidebar">
          <ViewerSidebar
            tab={sidebarTab}
            onTabChange={setSidebarTab}
            pdfDoc={pdfDoc}
            pdfLoading={pdfLoading}
            pageCount={displayPageCount}
            toc={mergedToc}
            annotations={displayAnnotations}
            sharedAnnotationIds={sharedAnnotationIds}
            currentPage={page}
            onJump={setPage}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={(id) => deleteAnnotationMutation.mutate(id)}
            onExportAnnotations={handleExportAnnotations}
            onShareAnnotations={handleShareAnnotations}
            sharingAnnotations={shareAnnotationsMutation.isPending}
          />
        </aside>

        <div className="custom-scrollbar flex-1 overflow-auto p-4 sm:p-6">
          <div className={`mx-auto flex min-h-full justify-center ${viewMode === 'spread' ? 'max-w-6xl' : 'max-w-4xl'}`}>
            {pdfUrl ? (
              <PdfViewer
                pdfUrl={pdfUrl}
                pdfDoc={pdfDoc}
                pdfLoading={pdfLoading}
                pdfError={pdfError}
                page={page}
                zoom={zoom}
                viewMode={viewMode}
                annotations={displayAnnotations}
                searchMatches={searchMatches}
                activeSearchIndex={activeSearchIndex}
                annotationTool={annotationTool}
                penColor={penColor}
                watermark={policy?.watermark}
                showAnnotations={showAnnotations}
                annotationVisibility={annotationVisibility}
                policy={policy ?? null}
                onPageCount={handlePageCount}
                onPageJump={setPage}
                onDrawingComplete={handleDrawingComplete}
                onStickyPlace={handleStickyPlace}
                onSelection={handleSelection}
                onClearSelection={handleClearSelection}
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                閲覧セッションを準備中...
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <ViewerSidebar
          tab={sidebarTab}
          onTabChange={setSidebarTab}
          pdfDoc={pdfDoc}
          pdfLoading={pdfLoading}
          pageCount={displayPageCount}
          toc={mergedToc}
          annotations={displayAnnotations}
          sharedAnnotationIds={sharedAnnotationIds}
          currentPage={page}
          onJump={(p) => {
            setPage(p)
            setMobileSidebarOpen(false)
          }}
          onEditAnnotation={handleEditAnnotation}
          onDeleteAnnotation={(id) => deleteAnnotationMutation.mutate(id)}
          onExportAnnotations={handleExportAnnotations}
          onShareAnnotations={handleShareAnnotations}
          sharingAnnotations={shareAnnotationsMutation.isPending}
          onClose={() => setMobileSidebarOpen(false)}
          isMobile
        />
      </MobileSidebarDrawer>

      <ViewerSidebarToggle
        onClick={() => setMobileSidebarOpen(true)}
        annotationCount={displayAnnotations.length}
      />

      {pendingSelection && (
        <SelectionToolbar
          position={pendingSelection.position}
          selectedText={pendingSelection.text}
          activeColor={highlightColor}
          onColorChange={setHighlightColor}
          onHighlight={handleHighlight}
          onAddNote={handleOpenNoteFromSelection}
          onDismiss={() => setPendingSelection(null)}
        />
      )}

      <NoteDialog
        open={noteDialogOpen}
        selectedText={noteMode === 'selection' ? pendingSelection?.text : undefined}
        note={noteText}
        onNoteChange={setNoteText}
        onClose={() => {
          setNoteDialogOpen(false)
          setNoteText('')
        }}
        onSave={handleSaveNote}
        saving={addAnnotationMutation.isPending}
      />

      <EditAnnotationDialog
        open={!!editingAnnotation}
        annotation={editingAnnotation}
        note={editNote}
        color={editColor}
        onNoteChange={setEditNote}
        onColorChange={setEditColor}
        onClose={() => setEditingAnnotation(null)}
        onSave={handleSaveEdit}
        saving={updateAnnotationMutation.isPending}
      />

      <StickyNoteDialog
        open={stickyDialogOpen}
        note={stickyText}
        onNoteChange={setStickyText}
        onClose={() => {
          setStickyDialogOpen(false)
          setStickyPosition(null)
          setStickyText('')
        }}
        onSave={handleSaveSticky}
        saving={addAnnotationMutation.isPending}
      />

      <ShareAnnotationsDialog
        open={shareDialogOpen}
        shareUrl={shareUrl}
        expiresAt={shareExpiresAt}
        annotationCount={shareAnnotationCount}
        loading={shareAnnotationsMutation.isPending}
        onClose={() => setShareDialogOpen(false)}
      />
    </div>
  )
}
