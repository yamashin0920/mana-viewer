import { test, expect, API_BASE, LEARNER_TOKEN, openFirstContent, gotoBookshelf } from './fixtures'

test.describe('読書進捗', () => {
  test('最後に開いていたページを復元する', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPage: 7,
        progressPercent: 2.8,
        zoom: 1.2,
        viewMode: 'single',
      },
    })

    await openFirstContent(page)
    await expect(page.getByTestId('page-input')).toHaveValue('7', { timeout: 15_000 })

    await page.getByLabel('本棚に戻る').click()
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()

    await page.getByTestId('content-grid').getByRole('link', { name: /数学I 基礎テキスト/ }).first().click()
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('page-input')).toHaveValue('7', { timeout: 15_000 })
  })

  test('ページ移動後に本棚から再度開くと進捗が保存されている', async ({ page }) => {
    await openFirstContent(page)

    await page.getByTestId('page-input').fill('5')
    await page.getByTestId('page-input').press('Enter')
    await expect(page.getByTestId('page-input')).toHaveValue('5')

    await page.waitForTimeout(1200)

    await page.getByLabel('本棚に戻る').click()
    await gotoBookshelf(page)

    await page.getByTestId('content-grid').getByRole('link', { name: /数学I 基礎テキスト/ }).first().click()
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('page-input')).toHaveValue('5', { timeout: 15_000 })
  })
})
