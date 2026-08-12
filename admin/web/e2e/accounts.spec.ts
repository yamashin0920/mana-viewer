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

  test('ユーザーのライセンス割当を変更できる', async ({ page }) => {
    await page.getByTestId('user-licenses-user-001').click()
    await expect(page.getByTestId('user-licenses-form')).toBeVisible()

    const englishCheckbox = page.getByTestId('user-licenses-form').getByRole('checkbox', { name: /英語コミュニケーションI/ })
    await englishCheckbox.uncheck()
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByTestId('user-licenses-form')).not.toBeVisible()
    await expect(page.getByTestId('users-table')).not.toContainText('英語コミュニケーションI')

    await page.getByTestId('user-licenses-user-001').click()
    await page.getByTestId('user-licenses-form').getByRole('checkbox', { name: /英語コミュニケーションI/ }).check()
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByTestId('users-table')).toContainText('英語コミュニケーションI')
  })
})
