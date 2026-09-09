import { test, expect, openFirstContent, LEARNER_TOKEN, API_BASE } from './fixtures'

test.describe('印刷制御', () => {
  test('印刷NGの教材には印刷ボタンが出ない', async ({ page }) => {
    await openFirstContent(page)
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('print-button')).toHaveCount(0)
  })

  test('印刷NGの教材で Ctrl+P するとトーストが出る', async ({ page }) => {
    await openFirstContent(page)
    await page.keyboard.press('Control+p')
    await expect(page.getByTestId('toast')).toContainText('この教材は印刷できません')
  })

  test('印刷OKの教材には印刷ボタンがある', async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => {
        ;(window as unknown as { __printCalled?: boolean }).__printCalled = true
      }
    })
    await page.goto('/viewer/content-003')
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('print-button')).toBeVisible()
    await page.getByTestId('print-button').click()
    const called = await page.evaluate(() => (window as unknown as { __printCalled?: boolean }).__printCalled)
    expect(called).toBe(true)
  })
})

test.describe('LMS 起動パラメータ', () => {
  test('?page= と lmsLaunch で指定ページとバナーを出す', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPage: 1,
        progressPercent: 0.4,
        zoom: 1.2,
        viewMode: 'single',
      },
    })
    await page.goto('/viewer/content-001?page=6&lmsLaunch=1&courseId=lms-course-501')
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('lms-launch-banner')).toBeVisible()
    await expect(page.getByTestId('page-input')).toHaveValue('6')
  })
})
