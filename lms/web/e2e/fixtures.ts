import { test as base, expect, type Page } from '@playwright/test'

export const LEARNER_TOKEN = 'mock-token-learner'
export const INSTRUCTOR_TOKEN = 'mock-token-instructor'

const AUTH_WEB_URL = process.env.AUTH_WEB_URL || 'http://localhost:5180'
const LMS_URL = process.env.LMS_URL || 'http://localhost:5200'

export async function loginAsLearnerToLms(page: Page) {
  const returnUrl = encodeURIComponent(`${LMS_URL}/courses`)
  await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
  await page.getByTestId('login-user-id').fill('demo')
  await page.getByTestId('login-password').fill('demo')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(/\/courses/)
  await expect(page.getByTestId('lms-layout')).toBeVisible()
}

export async function loginAsInstructorToLms(page: Page) {
  const returnUrl = encodeURIComponent(`${LMS_URL}/courses`)
  await page.goto(`${AUTH_WEB_URL}/login?redirect=${returnUrl}`)
  await page.getByTestId('login-user-id').fill('instructor')
  await page.getByTestId('login-password').fill('instructor')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(/\/courses/)
  await expect(page.getByTestId('lms-layout')).toBeVisible()
}

export const test = base
export { expect }
