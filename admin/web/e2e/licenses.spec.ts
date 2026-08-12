import { test, expect, loginAsAdmin } from './fixtures'

test.describe('ライセンス管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByTestId('admin-nav-licenses').click()
    await expect(page.getByTestId('licenses-page')).toBeVisible()
  })

  test('ライセンス一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('licenses-table')).toBeVisible()
    await expect(page.getByTestId('licenses-table')).toContainText('数学I 基礎テキスト')
    await expect(page.getByTestId('licenses-table')).toContainText('英語コミュニケーションI')
    await expect(page.getByTestId('licenses-table')).toContainText('物理基礎 実験マニュアル')
  })

  test('ライセンスの割当状況が表示される', async ({ page }) => {
    await expect(page.getByTestId('licenses-table')).toContainText('有効')
    await expect(page.getByTestId('licenses-table')).toContainText('田中 太郎')
  })
})
