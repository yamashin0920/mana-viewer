import { test, expect, gotoBookshelf, waitForPdfRender } from './fixtures'

test.describe('チャンク配信と DRM', () => {
  test('PDF 表示前にセッション付きでチャンクを取得する', async ({ page }) => {
    await gotoBookshelf(page)
    const chunkPromise = page.waitForRequest(
      (req) => req.url().includes('/chunks/') && req.method() === 'GET',
    )
    await page.getByTestId('content-card').first().click()
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    const chunk = await chunkPromise
    expect(chunk.headers()['x-session-token']).toMatch(/^session-/)
    await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible({ timeout: 30_000 })
  })

  test('コピー禁止・印刷禁止の DRM 属性を PDF に適用する', async ({ page }) => {
    await page.goto('/viewer/content-001')
    await waitForPdfRender(page)
    const root = page.getByTestId('viewer-page')
    await expect(root).toHaveAttribute('data-allow-copy', 'false')
    await expect(root).toHaveAttribute('data-allow-print', 'false')
  })

  test('コピー操作はクリップボードへ出さない', async ({ page }) => {
    await page.goto('/viewer/content-001')
    await waitForPdfRender(page)
    await expect(page.getByTestId('viewer-page')).toHaveAttribute('data-allow-copy', 'false')
    const prevented = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="viewer-page"]')
      if (!root) return false
      const event = new ClipboardEvent('copy', { bubbles: true, cancelable: true })
      root.dispatchEvent(event)
      return event.defaultPrevented
    })
    expect(prevented).toBe(true)
  })
})
