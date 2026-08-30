import { test, expect, loginAsAdmin } from './fixtures'

test.describe('共有 UI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('削除はネイティブ confirm ではなく確認ダイアログで行う', async ({ page }) => {
    let nativeDialogShown = false
    page.on('dialog', async (dialog) => {
      nativeDialogShown = true
      await dialog.dismiss()
    })

    const row = page.getByTestId('users-table').locator('tbody tr').first()
    const name = (await row.locator('td').first().innerText()).trim()
    await row.getByRole('button').last().click()

    const dialog = page.getByTestId('confirm-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toContainText(name)

    await page.getByTestId('confirm-dialog-cancel').click()
    await expect(dialog).toBeHidden()
    expect(nativeDialogShown).toBe(false)
    await expect(page.getByTestId('users-table')).toContainText(name)
  })

  test('テーマ切替がリロード後も保持される', async ({ page }) => {
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)

    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/dark/)

    await page.reload()
    await expect(page.getByTestId('admin-layout')).toBeVisible()
    await expect(html).toHaveClass(/dark/)

    // 後続テストに影響しないよう戻す
    await page.getByTestId('theme-toggle').click()
    await expect(html).not.toHaveClass(/dark/)
  })
})
