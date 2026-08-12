import { test, expect, openFirstContent, waitForPdfRender } from './fixtures'

test.describe('PDF ビューア', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstContent(page)
  })

  test('PDFが表示されタイトルが見える', async ({ page }) => {
    await expect(page.getByRole('banner').getByText('数学I 基礎テキスト')).toBeVisible()
    await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible()
  })

  test('ページ送りができる', async ({ page }) => {
    const pageInput = page.getByTestId('page-input')
    const initial = Number(await pageInput.inputValue())
    await page.getByLabel('次のページ').click()
    await expect(pageInput).toHaveValue(String(initial + 1))

    await page.getByLabel('前のページ').click()
    await expect(pageInput).toHaveValue(String(initial))
  })

  test('キーボードでページ移動できる', async ({ page }) => {
    const pageInput = page.getByTestId('page-input')
    const initial = Number(await pageInput.inputValue())

    await page.keyboard.press('ArrowRight')
    await expect(pageInput).toHaveValue(String(initial + 1))

    await page.keyboard.press('ArrowLeft')
    await expect(pageInput).toHaveValue(String(initial))
  })

  test('ページ番号を直接入力できる', async ({ page }) => {
    await page.getByTestId('page-input').fill('3')
    await page.getByTestId('page-input').press('Enter')
    await expect(page.getByTestId('page-input')).toHaveValue('3')
    await waitForPdfRender(page)
  })

  test('ズームが変更できる', async ({ page }) => {
    const zoomDisplay = page.getByLabel('拡大').locator('xpath=preceding-sibling::span[1]')
    const before = Number((await zoomDisplay.textContent())?.replace('%', '') ?? 0)

    await page.getByLabel('拡大').click()
    await expect(zoomDisplay).toHaveText(`${before + 10}%`)

    await page.getByLabel('縮小').click()
    await expect(zoomDisplay).toHaveText(`${before}%`)
  })

  test('見開き表示に切り替えられる', async ({ page }) => {
    await page.getByTestId('view-mode-spread').click()
    await expect(page.locator('[data-testid="pdf-canvas"]')).toHaveCount(2)

    await page.getByTestId('view-mode-single').click()
    await expect(page.locator('[data-testid="pdf-canvas"]')).toHaveCount(1)
  })

  test('サムネイル一覧からページジャンプできる', async ({ page }) => {
    await expect(page.getByTestId('desktop-sidebar')).toBeVisible()
    await page.getByTestId('sidebar-tab-thumbnails').click()

    const grid = page.getByTestId('thumbnail-grid')
    await expect(grid).toBeVisible()
    await expect(page.getByTestId('thumbnail-page-1')).toBeVisible()

    await page.getByTestId('thumbnail-page-3').click()
    await expect(page.getByTestId('page-input')).toHaveValue('3')
    await waitForPdfRender(page)
  })

  test('PDF内テキスト検索ができる', async ({ page }) => {
    await page.getByTestId('search-toggle').click()
    await expect(page.getByTestId('search-bar')).toBeVisible()

    await page.getByTestId('search-input').fill('Trace')
    await expect(page.getByTestId('search-status')).toContainText(/\d+ \/ \d+/, { timeout: 15_000 })
    await expect(page.getByTestId('search-highlight-active').first()).toBeVisible()

    await page.getByTestId('search-next').click()
    await expect(page.getByTestId('search-status')).toContainText(/2 \/ \d+/)
  })

  test('目次の外部リンクが表示される', async ({ page, context }) => {
    await expect(page.getByTestId('desktop-sidebar')).toBeVisible()
    await page.getByTestId('sidebar-tab-toc').click()

    const externalLink = page.getByTestId('toc-external-link')
    await expect(externalLink).toBeVisible()
    await expect(externalLink).toHaveAttribute('href', 'https://example.com/math-reference')

    const popupPromise = context.waitForEvent('page')
    await externalLink.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL('https://example.com/math-reference')
    await popup.close()
  })

  test('PDF内リンクレイヤーが表示される', async ({ page }) => {
    await expect(page.getByTestId('pdf-link-layer')).toBeVisible()
  })

  test('目次からページジャンプできる', async ({ page }) => {
    await expect(page.getByTestId('desktop-sidebar')).toBeVisible()
    await page.getByTestId('sidebar-tab-toc').click()

    const tocItem = page.getByTestId('toc-page-link').filter({ hasText: '第1章 数と式' })
    if (await tocItem.isVisible()) {
      await tocItem.click()
      await waitForPdfRender(page)
    }
  })

  test('ブックマークを追加できる', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: 'ブックマーク' }).click()
    await expect(page.getByText('ブックマークを追加しました')).toBeVisible()

    await page.getByTestId('sidebar-tab-annotations').click()
    await expect(page.getByTestId('desktop-sidebar').getByText('p.').first()).toBeVisible()
  })

  test('本棚に戻れる', async ({ page }) => {
    await page.getByLabel('本棚に戻る').click()
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
  })
})
