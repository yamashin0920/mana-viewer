import { test as base, expect } from '@playwright/test'
import { gotoBookshelf, LEARNER_TOKEN } from './fixtures'

const AUTH_APP_URL = 'http://localhost:5180'

base.describe('認証・ルート保護', () => {
  base('未認証時は認証サービスへリダイレクトする', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('accessToken')
    })
    await page.goto('/')
    await page.waitForURL(new RegExp(`${AUTH_APP_URL.replace(/\./g, '\\.')}/login`), { timeout: 15_000 })
    await expect(page.getByTestId('login-user-id')).toBeVisible()
  })

  base('ログアウトすると認証サービスのログアウトへ遷移する', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('accessToken', token)
    }, LEARNER_TOKEN)
    await gotoBookshelf(page)

    await page.getByTestId('logout-button').click()
    await page.waitForURL(new RegExp(`${AUTH_APP_URL.replace(/\./g, '\\.')}/logout`), { timeout: 15_000 })
  })

  base('組織名とユーザーロールがヘッダーに表示される', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('accessToken', token)
    }, LEARNER_TOKEN)
    await gotoBookshelf(page)

    await expect(page.getByText('東京学習高等学校')).toBeVisible()
    await expect(page.getByText('田中 太郎')).toBeVisible()
    await expect(page.locator('span').filter({ hasText: '学習者' }).first()).toBeVisible()
  })
})
