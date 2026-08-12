import { test, expect, loginAsAdmin } from './fixtures'

test.describe('管理画面ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('サイドバーから各ページに遷移できる', async ({ page }) => {
    await page.getByTestId('admin-nav-licenses').click()
    await expect(page).toHaveURL(/\/licenses/)
    await expect(page.getByTestId('licenses-page')).toBeVisible()

    await page.getByTestId('admin-nav-contents').click()
    await expect(page).toHaveURL(/\/contents/)
    await expect(page.getByTestId('contents-page')).toBeVisible()

    await page.getByTestId('admin-nav-accounts').click()
    await expect(page).toHaveURL(/\/accounts/)
    await expect(page.getByTestId('accounts-page')).toBeVisible()
  })

  test('ログアウトすると共通ログイン画面へ移動する', async ({ page }) => {
    await page.getByTestId('admin-logout').click()
    await page.waitForURL(/localhost:5180\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  test('未ログイン時は保護ページにアクセスできない', async ({ page }) => {
    await page.getByTestId('admin-logout').click()
    await page.waitForURL(/localhost:5180\/login/)
    await page.goto('/licenses')
    await page.waitForURL(/localhost:5180\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })
})
