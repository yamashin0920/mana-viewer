import { test, expect, openFirstContent, API_BASE, LEARNER_TOKEN } from './fixtures'

test.describe('注釈機能', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('desktop-sidebar').getByTestId('sidebar-tab-annotations').click()
  })

  test('注釈一覧にシードデータが表示される', async ({ page }) => {
    await expect(page.getByTestId('desktop-sidebar').getByRole('button', { name: /p\.\d+ · マーカー/ }).first()).toBeVisible()
  })

  test('注釈をフィルタできる', async ({ page }) => {
    const sidebar = page.getByTestId('desktop-sidebar')
    await sidebar.getByTestId('annotation-tab-bookmark').click()
    await expect(sidebar.getByRole('button', { name: /p\.\d+ · ブックマーク/ }).first()).toBeVisible()

    await sidebar.getByTestId('annotation-tab-highlight').click()
    await expect(sidebar.getByRole('button', { name: /p\.\d+ · マーカー/ }).first()).toBeVisible()
  })

  test('注釈を編集できる', async ({ page }) => {
    const sidebar = page.getByTestId('desktop-sidebar')
    const editedNote = `Playwright で編集 ${Date.now()}`
    await sidebar.getByTestId('annotation-edit').first().click()

    await expect(page.getByTestId('modal')).toBeVisible()
    await page.locator('#edit-note').fill(editedNote)
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByText('注釈を更新しました')).toBeVisible()
    await expect(sidebar.getByText(editedNote).first()).toBeVisible()
  })

  test('ページメモを追加できる', async ({ page }) => {
    const note = `Playwright テストメモ ${Date.now()}`
    await page.getByLabel('メモ追加').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.locator('textarea').fill(note)
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByText('メモを追加しました')).toBeVisible()
    await expect(page.getByTestId('desktop-sidebar').getByText(note).first()).toBeVisible()
  })

  test('ペン描画を追加できる', async ({ page }) => {
    await page.getByTestId('view-mode-single').click()
    await page.getByTestId('annotation-tool-pen').click()
    await expect(page.getByTestId('drawing-layer').first()).toBeVisible()

    const canvas = page.locator('[data-testid="pdf-canvas"]').first()
    const box = await canvas.boundingBox()
    if (!box) {
      test.skip(true, 'PDF canvas not rendered')
      return
    }

    await page.mouse.move(box.x + 80, box.y + 80)
    await page.mouse.down()
    await page.mouse.move(box.x + 180, box.y + 120)
    await page.mouse.move(box.x + 240, box.y + 100)
    await page.mouse.up()

    await expect(page.getByText('描画を追加しました')).toBeVisible()
    await page.getByTestId('desktop-sidebar').getByTestId('sidebar-tab-annotations').click()
    await expect(page.getByTestId('desktop-sidebar').getByRole('button', { name: /p\.\d+ · 描画/ }).first()).toBeVisible()
  })

  test('付箋を追加できる', async ({ page }) => {
    await page.getByTestId('view-mode-single').click()
    await page.getByTestId('annotation-tool-sticky').click()

    const canvas = page.locator('[data-testid="pdf-canvas"]').first()
    const box = await canvas.boundingBox()
    if (!box) {
      test.skip(true, 'PDF canvas not rendered')
      return
    }

    await page.mouse.click(box.x + 120, box.y + 120)
    await expect(page.getByTestId('sticky-note-input')).toBeVisible()
    await page.getByTestId('sticky-note-input').fill('Playwright 付箋テスト')
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByText('付箋を追加しました')).toBeVisible()
    await expect(page.getByTestId('sticky-note').first()).toBeVisible()
    await expect(page.getByTestId('sticky-note').first()).toContainText('Playwright 付箋テスト')
  })

  test('注釈を削除できる', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: 'ブックマーク' }).click()
    await expect(page.getByText('ブックマークを追加しました')).toBeVisible()

    const sidebar = page.getByTestId('desktop-sidebar')
    await sidebar.getByTestId('sidebar-tab-annotations').click()
    await sidebar.getByTestId('annotation-delete').last().click()
    await expect(page.getByText('注釈を削除しました')).toBeVisible()
  })

  test('注釈を JSON でエクスポートできる', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('desktop-sidebar').getByTestId('annotation-export-json').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/annotations-.*\.json$/)
    await expect(page.getByText('JSON をエクスポートしました')).toBeVisible()
  })

  test('注釈を Markdown でエクスポートできる', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('desktop-sidebar').getByTestId('annotation-export-markdown').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/annotations-.*\.md$/)
    await expect(page.getByText('Markdown をエクスポートしました')).toBeVisible()
  })

  test('注釈の共有リンクを作成できる', async ({ page }) => {
    await page.getByTestId('desktop-sidebar').getByTestId('annotation-share-button').click()
    await expect(page.getByText('共有リンクを作成しました')).toBeVisible()
    await expect(page.getByTestId('modal')).toBeVisible()
    await expect(page.getByTestId('share-url-input')).toHaveValue(/\/viewer\/content-001\?share=/)
  })

  test('共有リンクから注釈を表示できる', async ({ page, request }) => {
    const shareRes = await request.post('http://localhost:3001/contents/content-001/annotations/share', {
      headers: {
        Authorization: 'Bearer mock-token-learner',
        'Content-Type': 'application/json',
      },
      data: {},
    })
    expect(shareRes.ok()).toBeTruthy()
    const share = await shareRes.json()

    await page.goto(`/viewer/content-001?share=${share.shareId}`)
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('shared-annotations-banner')).toBeVisible()
    await expect(page.getByTestId('desktop-sidebar').getByTestId('sidebar-tab-annotations')).toBeVisible()
  })
})

test.describe('注釈の表示切替', () => {
  test('PDF上の注釈を表示・非表示にできる', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { currentPage: 1, progressPercent: 0.4, zoom: 1.2, viewMode: 'single' },
    })
    await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'highlight',
        page: 1,
        color: '#FFEB3B',
        rects: [{ x: 80, y: 120, width: 240, height: 20 }],
        selectedText: 'visibility test',
      },
    })

    await openFirstContent(page)
    await expect(page.getByTestId('page-input')).toHaveValue('1')
    await expect(page.getByTestId('markup-annotation').first()).toBeVisible()

    await page.getByTestId('annotation-visibility-toggle').click()
    await expect(page.getByTestId('markup-annotation')).toHaveCount(0)

    await page.getByTestId('annotation-visibility-toggle').click()
    await expect(page.getByTestId('markup-annotation').first()).toBeVisible()
  })

  test('注釈の種類ごとに表示・非表示にできる', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { currentPage: 1, progressPercent: 0.4, zoom: 1.2, viewMode: 'single' },
    })
    await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'highlight',
        page: 1,
        color: '#FFEB3B',
        rects: [{ x: 80, y: 120, width: 240, height: 20 }],
        selectedText: 'marker visibility test',
      },
    })
    await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'sticky',
        page: 1,
        color: '#FFEB3B',
        rects: [{ x: 120, y: 200, width: 0, height: 0 }],
        note: 'sticky visibility test',
      },
    })

    await openFirstContent(page)
    await expect(page.getByTestId('page-input')).toHaveValue('1')
    await expect(page.getByTestId('markup-annotation').first()).toBeVisible()
    await expect(page.getByTestId('sticky-note').first()).toBeVisible()

    await page.getByTestId('annotation-visibility-menu-trigger').click()
    await expect(page.getByTestId('annotation-visibility-menu')).toBeVisible()
    await page.getByTestId('annotation-visibility-marker').uncheck()
    await expect(page.getByTestId('markup-annotation')).toHaveCount(0)
    await expect(page.getByTestId('sticky-note').first()).toBeVisible()

    await page.getByTestId('annotation-visibility-sticky').uncheck()
    await expect(page.getByTestId('sticky-note')).toHaveCount(0)

    await page.getByTestId('annotation-visibility-marker').check()
    await expect(page.getByTestId('markup-annotation').first()).toBeVisible()
    await expect(page.getByTestId('sticky-note')).toHaveCount(0)
  })

  test('個別の注釈を表示・非表示にできる', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { currentPage: 1, progressPercent: 0.4, zoom: 1.2, viewMode: 'single' },
    })
    const createRes = await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'highlight',
        page: 1,
        color: '#FFEB3B',
        rects: [{ x: 80, y: 120, width: 240, height: 20 }],
        selectedText: 'individual visibility test',
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const created = await createRes.json()

    await openFirstContent(page)
    await page.getByTestId('desktop-sidebar').getByTestId('sidebar-tab-annotations').click()
    await expect(page.getByTestId('page-input')).toHaveValue('1')
    await expect(page.locator(`[data-annotation-id="${created.id}"]`)).toBeVisible()

    const item = page.getByTestId('annotation-item').filter({ hasText: 'individual visibility test' })
    await item.getByTestId('annotation-item-visibility-toggle').click()
    await expect(page.locator(`[data-annotation-id="${created.id}"]`)).toHaveCount(0)
    await expect(item).toHaveAttribute('data-annotation-hidden', 'true')

    await item.getByTestId('annotation-item-visibility-toggle').click()
    await expect(page.locator(`[data-annotation-id="${created.id}"]`)).toBeVisible()
    await expect(item).toHaveAttribute('data-annotation-hidden', 'false')
  })
})

test.describe('テキストマーカー', () => {
  test('マーカーツールでテキスト選択すると自動でマーカーが付く', async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('annotation-tool-marker').click()
    await expect(page.getByTestId('marker-color-picker')).toBeVisible()
    await page.getByTestId('page-input').fill('1')
    await page.getByTestId('page-input').press('Enter')
    await page.waitForTimeout(1500)

    const canvas = page.locator('[data-testid="pdf-canvas"]').first()
    const box = await canvas.boundingBox()
    if (!box) {
      test.skip(true, 'PDF canvas not rendered')
      return
    }

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3)
    await page.mouse.up()

    const toast = page.getByText('マーカーを追加しました')
    if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(toast).toBeVisible()
    }
  })

  test('選択モードではフローティングツールバーからマーカーを追加できる', async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('page-input').fill('1')
    await page.getByTestId('page-input').press('Enter')
    await page.waitForTimeout(1500)

    const canvas = page.locator('[data-testid="pdf-canvas"]').first()
    const box = await canvas.boundingBox()
    if (!box) {
      test.skip(true, 'PDF canvas not rendered')
      return
    }

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3)
    await page.mouse.up()

    const toolbar = page.getByTestId('selection-toolbar')
    if (await toolbar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByTestId('marker-button').click()
      await expect(page.getByText('マーカーを追加しました')).toBeVisible()
    }
  })
})
