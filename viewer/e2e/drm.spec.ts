import { test, expect, openFirstContent } from './fixtures'

test.describe('DRM・ウォーターマーク', () => {
  test('ウォーターマークが PDF 上に表示される', async ({ page }) => {
    await openFirstContent(page)
    const watermark = page.getByTestId('pdf-watermark').first()
    await expect(watermark).toBeVisible()
    await expect(watermark).toContainText('東京学習高等学校')
    await expect(watermark).toContainText('田中 太郎')
  })

  test('ライセンスがない教材は閲覧できない', async ({ page }) => {
    await page.route('**/api/licenses/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          allowed: false,
          canView: false,
          canDownloadOffline: false,
          reason: 'license_not_found',
        }),
      })
    })

    await page.goto('/viewer/content-001')
    await expect(page.getByTestId('license-denied')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('ライセンスがありません')).toBeVisible()
  })
})
