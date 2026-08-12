import { test, expect } from '@playwright/test'

test.describe('ログイン', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('未ログインで本棚にアクセスするとログイン画面へ', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  test('空欄ではログインできない', async ({ page }) => {
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toHaveText('ID とパスワードを入力してください')
  })

  test('任意の ID / パスワードで本棚に進める', async ({ page }) => {
    await page.getByTestId('login-user-id').fill('demo-user')
    await page.getByTestId('login-password').fill('demo-pass')
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
    await expect(page.getByTestId('content-card').first()).toBeVisible()
  })

  test('ログアウトするとログイン画面に戻る', async ({ page }) => {
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()

    await page.getByTestId('logout-button').click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })
})
