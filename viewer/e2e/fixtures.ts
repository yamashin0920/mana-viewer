import { test as base, expect } from '@playwright/test'

export const LEARNER_TOKEN = 'mock-token-learner'
export const API_BASE = 'http://localhost:3001'

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

/**
 * 開始ページを明示する。
 * 読書進捗は seed に永続化され、最終ページまで進んだ状態が次の実行に持ち越されるため、
 * ページ移動を検証するテストは開始位置を固定する必要がある。
 */
export async function setPage(page: import('@playwright/test').Page, pageNumber: number) {
  const input = page.getByTestId('page-input')
  await input.fill(String(pageNumber))
  await expect(input).toHaveValue(String(pageNumber))
  // 入力欄にフォーカスが残るとキーボードのページ移動が無効になるため外す
  await input.blur()
}

/** 狭い画面では二次ツールがトレイに隠れているので、必要なときだけ開く */
export async function expandViewerTools(page: import('@playwright/test').Page) {
  const toggle = page.getByTestId('viewer-secondary-controls-toggle')
  if (await toggle.isVisible()) {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click()
    }
    await expect(page.getByTestId('viewer-secondary-controls')).toBeVisible()
  }
}

/** PDF ページの描画完了を待つ */
export async function waitForPdfRender(page: import('@playwright/test').Page) {
  await expect(page.locator('[data-testid="pdf-canvas"]').first()).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(500)
}
