import { test as base, expect } from '@playwright/test'

export const LEARNER_TOKEN = 'mock-token-learner'

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((token) => {
      localStorage.setItem('accessToken', token)
    }, LEARNER_TOKEN)
    await use(page)
  },
})

export { expect }

/** 本棚ページへ移動し、読み込み完了を待つ */
export async function gotoBookshelf(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.getByTestId('bookshelf-page')).toBeVisible()
  await expect(page.getByTestId('content-card').first()).toBeVisible()
}

/** 最初の教材を開く */
export async function openFirstContent(page: import('@playwright/test').Page) {
  await gotoBookshelf(page)
  const firstCard = page.getByTestId('content-card').first()
  const href = await firstCard.getAttribute('href')
  await firstCard.click()
  await expect(page).toHaveURL(/\/viewer\//)
  await expect(page.getByTestId('viewer-page')).toBeVisible()
  await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible({ timeout: 30_000 })
  return href
}

/** PDF ページの描画完了を待つ */
export async function waitForPdfRender(page: import('@playwright/test').Page) {
  await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(500)
}
