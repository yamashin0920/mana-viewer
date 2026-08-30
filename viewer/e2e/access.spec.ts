import { test, expect, openFirstContent, waitForPdfRender } from './fixtures'

test.describe('閲覧権限と透かし', () => {
  test('存在しない教材は見つからないと表示する', async ({ page }) => {
    await page.goto('/viewer/content-missing')
    await expect(page.getByTestId('content-not-found')).toBeVisible()
    await expect(page.getByText('教材が見つかりません')).toBeVisible()
    await page.getByRole('button', { name: '本棚に戻る' }).click()
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
  })

  test('ライセンスがない教材は拒否画面を表示する', async ({ page }) => {
    await page.route('**/licenses/verify', async (route) => {
      if (route.request().method() === 'POST') {
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
        return
      }
      await route.continue()
    })

    await page.goto('/viewer/content-001')
    await expect(page.getByTestId('license-denied')).toBeVisible()
    await expect(page.getByText('ライセンスがありません')).toBeVisible()
    await expect(page.getByText('この教材を閲覧する権限がありません')).toBeVisible()
    await page.getByRole('button', { name: '本棚に戻る' }).click()
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
  })

  test('PDF に学習者名の透かしが表示される', async ({ page }) => {
    await openFirstContent(page)
    await waitForPdfRender(page)
    await expect(page.getByTestId('pdf-watermark').first()).toBeVisible()
    await expect(page.getByTestId('pdf-watermark').first()).toContainText('田中 太郎')
  })
})
