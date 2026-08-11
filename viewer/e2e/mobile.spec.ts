import { test, expect, openFirstContent } from './fixtures'

test.describe('モバイル表示', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('FABからサイドバーを開ける', async ({ page }) => {
    await openFirstContent(page)

    await expect(page.getByTestId('desktop-sidebar')).toBeHidden()
    await page.getByTestId('mobile-sidebar-toggle').click()
    await expect(page.getByTestId('mobile-sidebar-drawer')).toBeVisible()
    await page.getByTestId('mobile-sidebar-drawer').getByTestId('sidebar-tab-annotations').click()
    await expect(page.getByTestId('mobile-sidebar-drawer').getByText(/p\.\d+ · ハイライト|p\.\d+ · ブックマーク/).first()).toBeVisible()
  })

  test('モバイルツールバーでページ移動できる', async ({ page }) => {
    await openFirstContent(page)

    const pageInput = page.getByTestId('page-input')
    const initial = Number(await pageInput.inputValue())

    await page.getByLabel('次のページ').click()
    await expect(pageInput).toHaveValue(String(initial + 1))
  })

  test('本棚がモバイルで表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card').first()).toBeVisible()
    await expect(page.getByTestId('search-input')).toBeVisible()
  })
})
