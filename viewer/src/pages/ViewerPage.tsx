import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  getDemoPdfUrl,
  saveProgress,
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
import type { Annotation } from '../types'

const USE_DEMO_PDF = import.meta.env.VITE_USE_DEMO_PDF !== 'false'

export function ViewerPage() {
  const { contentId = '' } = useParams()
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
      setPage(Math.min(progressData.currentPage, pageCount))
    }
    if (progressData?.viewMode === 'spread' || progressData?.viewMode === 'single') {
      setViewMode(progressData.viewMode as ViewMode)
    }
    if (progressData?.zoom) {
      setZoom(progressData.zoom)
    }
  }, [progressData?.currentPage, progressData?.viewMode, progressData?.zoom, pageCount])

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
    if (!contentId || !content) return
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
  }, [page, pageCount, zoom, viewMode, contentId, content])

  const addAnnotationMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createAnnotation>[1]) =>
      createAnnotation(contentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] })
      setSidebarTab('annotations')
      setPendingSelection(null)
      setNoteDialogOpen(false)
      setNoteText('')
      const labels = { highlight: 'ハイライト', bookmark: 'ブックマーク', note: 'メモ', underline: '下線' }
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

  const handleSelection = useCallback((selection: TextSelection) => {
    setPendingSelection(selection)
  }, [])

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
        color: editingAnnotation.type === 'highlight' ? editColor : editingAnnotation.color,
      },
    })
  }, [updateAnnotationMutation, editingAnnotation, editNote, editColor])

  const pdfUrl = useMemo(() => {
    if (USE_DEMO_PDF) return getDemoPdfUrl(contentId)
    if (!sessionToken) return ''
    return getDemoPdfUrl(contentId)
  }, [contentId, sessionToken])

  const { pdfDoc, loading: pdfLoading, error: pdfError, numPages: pdfNumPages } = usePdfDocument(
    pdfUrl || null
  )

  useEffect(() => {
    if (pdfNumPages > 0) {
      setPageCount(pdfNumPages)
    }
  }, [pdfNumPages])

  const annotations = annotationsData?.data ?? []
  const toc = content?.toc ?? []
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
      <ViewerToolbar
        title={content.title}
        page={page}
        pageCount={content.pageCount || pageCount}
        zoom={zoom}
        viewMode={viewMode}
        saving={progressMutation.isPending}
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
            toc={toc}
            annotations={annotations}
            currentPage={page}
            onJump={setPage}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={(id) => deleteAnnotationMutation.mutate(id)}
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
                annotations={annotations}
                watermark={policy?.watermark}
                policy={policy ?? null}
                onPageCount={handlePageCount}
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
          toc={toc}
          annotations={annotations}
          currentPage={page}
          onJump={(p) => {
            setPage(p)
            setMobileSidebarOpen(false)
          }}
          onEditAnnotation={handleEditAnnotation}
          onDeleteAnnotation={(id) => deleteAnnotationMutation.mutate(id)}
          onClose={() => setMobileSidebarOpen(false)}
          isMobile
        />
      </MobileSidebarDrawer>

      <ViewerSidebarToggle
        onClick={() => setMobileSidebarOpen(true)}
        annotationCount={annotations.length}
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
    </div>
  )
}
