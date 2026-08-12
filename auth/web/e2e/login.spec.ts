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

  test('登録済み ID / パスワードでトークン付き URL にリダイレクトする', async ({ page }) => {
    const returnUrl = encodeURIComponent('http://localhost:5180/login?from=test')
    await page.goto(`/login?redirect=${returnUrl}`)

    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()

    await page.waitForURL(/accessToken=mock-token-learner/, { timeout: 10_000 })
    expect(page.url()).toContain('accessToken=mock-token-learner')
    expect(page.url()).toContain('from=test')
  })

  test('未登録の ID / パスワードではログインできない', async ({ page }) => {
    await page.getByTestId('login-user-id').fill('unknown')
    await page.getByTestId('login-password').fill('wrong')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toHaveText('ID またはパスワードが正しくありません')
    await expect(page).toHaveURL(/\/login/)
  })

  test('管理画面向け redirect では行き先ラベルが表示される', async ({ page }) => {
    const returnUrl = encodeURIComponent('http://localhost:5190/accounts')
    await page.goto(`/login?redirect=${returnUrl}`)

    await expect(page.getByText('ログイン — 管理画面 へ移動します')).toBeVisible()
  })

  test('ビューア向け redirect では行き先ラベルが表示される', async ({ page }) => {
    const returnUrl = encodeURIComponent('http://localhost:5173/')
    await page.goto(`/login?redirect=${returnUrl}`)

    await expect(page.getByText('ログイン — ビューア へ移動します')).toBeVisible()
  })
})
