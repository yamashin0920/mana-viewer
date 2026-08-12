import { test, expect } from '@playwright/test'

test.describe('認証アプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/logout')
    await page.waitForURL(/\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  test('ログイン画面が表示される', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-user-id')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
    await expect(page.getByText('すべてのアプリで共通のログインです')).toBeVisible()
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

  test('既存セッションがあれば再入力なしでリダイレクトする（SSO）', async ({ page }) => {
    const returnUrl1 = encodeURIComponent('http://localhost:5180/login?from=first')
    await page.goto(`/login?redirect=${returnUrl1}`)
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()
    await page.waitForURL(/from=first/)

    const returnUrl2 = encodeURIComponent('http://localhost:5180/login?from=second')
    await page.goto(`/login?redirect=${returnUrl2}`)
    await page.waitForURL(/from=second/, { timeout: 10_000 })
    expect(page.url()).toContain('from=second')
  })

  test('ログアウトでセッションが破棄される', async ({ page }) => {
    const returnUrl = encodeURIComponent('http://localhost:5180/login?from=logged-in')
    await page.goto(`/login?redirect=${returnUrl}`)
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()
    await page.waitForURL(/from=logged-in/)

    await page.goto('/logout')
    await page.waitForURL(/\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()

    const returnUrl2 = encodeURIComponent('http://localhost:5180/login?from=after-logout')
    await page.goto(`/login?redirect=${returnUrl2}`)
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-user-id')).toBeVisible()
  })
})
