import { test, expect } from './fixtures'

test.describe('管理画面ログイン', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('ログイン画面が表示される', async ({ page }) => {
    await expect(page.getByTestId('admin-login-page')).toBeVisible()
    await expect(page.getByTestId('admin-login-user-id')).toBeVisible()
    await expect(page.getByTestId('admin-login-password')).toBeVisible()
  })

  test('空欄ではログインできない', async ({ page }) => {
    await page.getByTestId('admin-login-submit').click()
    await expect(page.getByTestId('admin-login-error')).toHaveText('ID とパスワードを入力してください')
  })

  test('管理者アカウントでログインできる', async ({ page }) => {
    await page.getByTestId('admin-login-user-id').fill('admin')
    await page.getByTestId('admin-login-password').fill('admin')
    await page.getByTestId('admin-login-submit').click()

    await page.waitForURL(/\/accounts/)
    await expect(page.getByTestId('admin-layout')).toBeVisible()
    await expect(page.getByTestId('accounts-page')).toBeVisible()
  })

  test('学習者アカウントではログインできない', async ({ page }) => {
    await page.getByTestId('admin-login-user-id').fill('demo')
    await page.getByTestId('admin-login-password').fill('demo')
    await page.getByTestId('admin-login-submit').click()

    await expect(page.getByTestId('admin-login-error')).toHaveText(
      '管理者権限のあるアカウントでログインしてください',
    )
    await expect(page).toHaveURL(/\/login/)
  })

  test('未登録の ID / パスワードではログインできない', async ({ page }) => {
    await page.getByTestId('admin-login-user-id').fill('unknown')
    await page.getByTestId('admin-login-password').fill('wrong')
    await page.getByTestId('admin-login-submit').click()

    await expect(page.getByTestId('admin-login-error')).toHaveText('ID またはパスワードが正しくありません')
    await expect(page).toHaveURL(/\/login/)
  })
})
