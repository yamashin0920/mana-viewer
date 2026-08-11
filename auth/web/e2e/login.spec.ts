import { test, expect } from '@playwright/test'

test.describe('認証アプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('ログイン画面が表示される', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-user-id')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
  })

  test('空欄ではログインできない', async ({ page }) => {
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toHaveText('ID とパスワードを入力してください')
  })

  test('任意の ID / パスワードでトークン付き URL にリダイレクトする', async ({ page }) => {
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()

    await page.waitForURL(/accessToken=mock-token-learner/, { timeout: 10_000 })
    expect(page.url()).toContain('localhost:5173')
    expect(page.url()).toContain('accessToken=')
  })
})
