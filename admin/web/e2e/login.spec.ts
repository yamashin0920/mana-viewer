import { test, expect } from './fixtures'

const AUTH_WEB_URL = process.env.AUTH_WEB_URL || 'http://localhost:5180'
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5190'

test.describe('管理画面の認証・認可', () => {
  test('未ログイン時は共通ログイン画面へリダイレクトする', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForURL(/\/login\?redirect=/)
    expect(page.url()).toContain(`${AUTH_WEB_URL}/login`)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  test('管理者は共通ログイン後に管理画面へ入れる', async ({ page }) => {
    const returnUrl = encodeURIComponent(`${ADMIN_URL}/accounts`)
    await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
    await page.getByTestId('login-user-id').fill('admin')
    await page.getByTestId('login-password').fill('admin')
    await page.getByTestId('login-submit').click()

    await page.waitForURL(/\/accounts/)
    await expect(page.getByTestId('admin-layout')).toBeVisible()
    await expect(page.getByTestId('accounts-page')).toBeVisible()
  })

  test('学習者はログイン後にアクセス拒否される（認可）', async ({ page }) => {
    const returnUrl = encodeURIComponent(`${ADMIN_URL}/accounts`)
    await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()

    await page.waitForURL(/\/accounts/)
    await expect(page.getByTestId('access-denied-page')).toBeVisible()
    await expect(page.getByText('アクセス権がありません')).toBeVisible()
  })
})
