import { test, expect, loginAsAdmin } from './fixtures'

test.describe('コンテンツ管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByTestId('admin-nav-contents').click()
    await expect(page.getByTestId('contents-page')).toBeVisible()
  })

  test('コンテンツ一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('contents-grid')).toBeVisible()
    await expect(page.getByTestId('contents-grid')).toContainText('数学I 基礎テキスト')
    await expect(page.getByTestId('contents-grid')).toContainText('英語コミュニケーションI')
    await expect(page.getByTestId('contents-grid')).toContainText('物理基礎 実験マニュアル')
  })

  test('公開ステータスが表示される', async ({ page }) => {
    await expect(page.getByTestId('contents-grid')).toContainText('公開')
  })
})
