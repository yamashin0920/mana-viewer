import { test, expect, gotoBookshelf, openFirstContent } from './fixtures'

async function resetLightMode(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  })
}

test.describe('ダークモード', () => {
  test('本棚でダークモードに切り替えられる', async ({ page }) => {
    await gotoBookshelf(page)
    await resetLightMode(page)

    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 15_000 })

    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('ビューアでもダークモードが維持される', async ({ page }) => {
    await gotoBookshelf(page)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByTestId('content-grid').getByRole('link').first().click()
    await expect(page.getByTestId('viewer-page')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('ライトモードに戻せる', async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})
