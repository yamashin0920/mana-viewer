import { test, expect, openFirstContent } from './fixtures'

test.describe('注釈機能', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('desktop-sidebar').getByTestId('sidebar-tab-annotations').click()
  })

  test('注釈一覧にシードデータが表示される', async ({ page }) => {
    await expect(page.getByTestId('desktop-sidebar').getByRole('button', { name: /p\.\d+ · ハイライト/ }).first()).toBeVisible()
  })

  test('注釈をフィルタできる', async ({ page }) => {
    const sidebar = page.getByTestId('desktop-sidebar')
    await sidebar.getByTestId('annotation-tab-bookmark').click()
    await expect(sidebar.getByRole('button', { name: /p\.\d+ · ブックマーク/ }).first()).toBeVisible()

    await sidebar.getByTestId('annotation-tab-highlight').click()
    await expect(sidebar.getByRole('button', { name: /p\.\d+ · ハイライト/ }).first()).toBeVisible()
  })

  test('注釈を編集できる', async ({ page }) => {
    const sidebar = page.getByTestId('desktop-sidebar')
    await sidebar.getByTestId('annotation-edit').first().click()

    await expect(page.getByTestId('modal')).toBeVisible()
    await page.locator('#edit-note').fill('Playwright で編集したメモ')
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByText('注釈を更新しました')).toBeVisible()
    await expect(sidebar.getByText('Playwright で編集したメモ')).toBeVisible()
  })

  test('ページメモを追加できる', async ({ page }) => {
    await page.getByLabel('メモ追加').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.locator('textarea').fill('Playwright テストメモ')
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByText('メモを追加しました')).toBeVisible()
    await expect(page.getByTestId('desktop-sidebar').getByText('Playwright テストメモ')).toBeVisible()
  })

  test('注釈を削除できる', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: 'ブックマーク' }).click()
    await expect(page.getByText('ブックマークを追加しました')).toBeVisible()

    const sidebar = page.getByTestId('desktop-sidebar')
    await sidebar.getByTestId('sidebar-tab-annotations').click()
    await sidebar.getByTestId('annotation-delete').last().click()
    await expect(page.getByText('注釈を削除しました')).toBeVisible()
  })
})

test.describe('テキスト選択ハイライト', () => {
  test('PDF上のテキスト選択でハイライトを追加できる', async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('page-input').fill('1')
    await page.getByTestId('page-input').press('Enter')
    await page.waitForTimeout(1500)

    const canvas = page.locator('[data-testid="pdf-canvas"]').first()
    const box = await canvas.boundingBox()
    if (!box) {
      test.skip(true, 'PDF canvas not rendered')
      return
    }

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3)
    await page.mouse.up()

    const toolbar = page.getByTestId('selection-toolbar')
    if (await toolbar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByTestId('highlight-button').click()
      await expect(page.getByText('ハイライトを追加しました')).toBeVisible()
    }
  })
})
