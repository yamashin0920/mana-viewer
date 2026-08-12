import { test as base, expect, type Page } from '@playwright/test'

export const ADMIN_TOKEN = 'mock-token-admin'
export const LEARNER_TOKEN = 'mock-token-learner'
export const INSTRUCTOR_TOKEN = 'mock-token-instructor'

const AUTH_WEB_URL = process.env.AUTH_WEB_URL || 'http://localhost:5180'
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5190'

/** 共通ログイン画面経由で管理者として管理画面に入る */
export async function loginAsAdmin(page: Page) {
  const returnUrl = encodeURIComponent(`${ADMIN_URL}/accounts`)
  await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
  await page.getByTestId('login-user-id').fill('admin')
  await page.getByTestId('login-password').fill('admin')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(/\/accounts/)
  await expect(page.getByTestId('admin-layout')).toBeVisible()
}

/** 共通ログイン画面経由で学習者として管理画面に入る（認可エラー想定） */
export async function loginAsLearnerToAdmin(page: Page) {
  const returnUrl = encodeURIComponent(`${ADMIN_URL}/accounts`)
  await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
  await page.getByTestId('login-user-id').fill('demo')
  await page.getByTestId('login-password').fill('demo')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(/\/accounts/)
}

export const test = base
export { expect }
