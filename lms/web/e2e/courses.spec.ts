import { test, expect, loginAsLearnerToLms, loginAsInstructorToLms } from './fixtures'

test.describe('LMS コース', () => {
  test('学習者がコース一覧と教材を見られる', async ({ page }) => {
    await loginAsLearnerToLms(page)
    await expect(page.getByTestId('lms-courses-page')).toBeVisible()
    await expect(page.getByTestId('lms-course-lms-course-501')).toBeVisible()
    await expect(page.getByTestId('lms-course-lms-course-501')).toContainText('2026年度 1年A組')

    await page.getByTestId('lms-course-lms-course-501').click()
    await expect(page.getByTestId('lms-course-page')).toBeVisible()
    await expect(page.getByTestId('lms-material-content-001')).toBeVisible()
    await expect(page.getByTestId('lms-members')).toContainText('田中 太郎')
  })

  test('講師は名簿同期できる', async ({ page }) => {
    await loginAsInstructorToLms(page)
    await page.getByTestId('lms-course-lms-course-501').click()
    await expect(page.getByTestId('lms-course-page')).toBeVisible()
    await page.getByTestId('lms-roster-sync').click()
    await expect(page.getByTestId('lms-sync-result')).toBeVisible()
  })
})

test.describe('LMS → ビューア起動', () => {
  test('指定ページでビューアが開き LMS バナーが出る', async ({ page }) => {
    await loginAsLearnerToLms(page)
    await page.getByTestId('lms-course-lms-course-501').click()
    await page.getByTestId('lms-page-content-001').fill('4')
    await page.getByTestId('lms-launch-content-001').click()

    await page.waitForURL(/\/viewer\/content-001/)
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.getByTestId('lms-launch-banner')).toBeVisible()
    await expect(page.getByTestId('page-input')).toHaveValue('4')
  })
})
