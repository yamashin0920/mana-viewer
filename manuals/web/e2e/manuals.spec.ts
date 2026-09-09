import { test, expect } from '@playwright/test'

test.describe('マニュアルアプリ', () => {
  test('目次がログインなしで開く', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('manuals-layout')).toBeVisible()
    await expect(page.getByTestId('manual-article')).toContainText('操作マニュアル')
    await expect(page.getByTestId('manuals-nav-learner')).toBeVisible()
  })

  test('学習者マニュアルに本文と印刷の手順がある', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('manuals-nav-learner').click()
    await expect(page).toHaveURL(/\/learner/)
    await expect(page.getByTestId('manual-article')).toHaveAttribute('data-manual-slug', 'learner')
    await expect(page.getByTestId('manual-article')).toContainText('学習者マニュアル')
    await expect(page.getByTestId('manual-article')).toContainText('印刷する')
  })

  test('マニュアル内リンクで講師ページへ移れる', async ({ page }) => {
    await page.goto('/learner')
    await page.getByTestId('manual-internal-link').filter({ hasText: '講師' }).first().click()
    await expect(page).toHaveURL(/\/instructor/)
    await expect(page.getByTestId('manual-article')).toContainText('講師マニュアル')
  })

  test('開発者マニュアルに単体起動の手順がある', async ({ page }) => {
    await page.goto('/developer')
    await expect(page.getByTestId('manual-article')).toHaveAttribute('data-manual-slug', 'developer')
    await expect(page.getByTestId('manual-article')).toContainText('localhost:5210')
    await expect(page.getByTestId('manual-article')).toContainText('cd manuals/web && npm run dev')
  })
})
