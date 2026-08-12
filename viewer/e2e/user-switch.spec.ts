import { test, expect } from '@playwright/test'

const AUTH_WEB = 'http://localhost:5180'
const VIEWER = 'http://localhost:5173'

test.describe('開発用ユーザー切替（auth ログイン後）', () => {
  test('auth ログイン後に切替すると本棚が変わる', async ({ page }) => {
    const returnUrl = encodeURIComponent(`${VIEWER}/`)
    await page.goto(`${AUTH_WEB}/login?redirect=${returnUrl}`)
    await page.getByTestId('login-user-id').fill('demo')
    await page.getByTestId('login-password').fill('demo')
    await page.getByTestId('login-submit').click()

    await page.waitForURL(`${VIEWER}/`)
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
    await expect(page.getByText('田中 太郎')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(3)

    await page.getByLabel('開発用ユーザー切替').selectOption('mock-token-instructor')
    await page.waitForURL(`${VIEWER}/`)
    await expect(page.getByText('鈴木 花子')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(1)

    await page.getByLabel('開発用ユーザー切替').selectOption('mock-token-admin')
    await page.waitForURL(`${VIEWER}/`)
    await expect(page.getByRole('paragraph').filter({ hasText: '管理者' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(0)
    await expect(page.getByText('教材が見つかりません')).toBeVisible()
  })
})
