import { test as base, expect, type Page } from '@playwright/test'

export const ADMIN_TOKEN = 'mock-token-admin'
export const LEARNER_TOKEN = 'mock-token-learner'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByTestId('admin-login-user-id').fill('admin')
  await page.getByTestId('admin-login-password').fill('admin')
  await page.getByTestId('admin-login-submit').click()
  await page.waitForURL(/\/accounts/)
  await expect(page.getByTestId('admin-layout')).toBeVisible()
}

export const test = base
export { expect }
