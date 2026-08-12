import { test, expect, loginAsAdmin } from './fixtures'

test.describe('アカウント管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('ログインアカウント一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('credentials-table')).toBeVisible()
    await expect(page.getByTestId('credentials-table')).toContainText('demo')
    await expect(page.getByTestId('credentials-table')).toContainText('admin')
  })

  test('ユーザー一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toBeVisible()
    await expect(page.getByTestId('users-table')).toContainText('田中 太郎')
    await expect(page.getByTestId('users-table')).toContainText('管理者')
  })

  test('ユーザーに割当ライセンスが表示される', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toContainText('数学I 基礎テキスト')
  })
})
