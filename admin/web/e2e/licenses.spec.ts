import { test, expect, loginAsAdmin, confirmDelete, cancelDelete } from './fixtures'

test.describe('ライセンス管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByTestId('admin-nav-licenses').click()
    await expect(page.getByTestId('licenses-page')).toBeVisible()
  })

  test('ライセンス一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('licenses-table')).toBeVisible()
    await expect(page.getByTestId('licenses-table')).toContainText('数学I 基礎テキスト')
    await expect(page.getByTestId('licenses-table')).toContainText('英語コミュニケーションI')
    await expect(page.getByTestId('licenses-table')).toContainText('物理基礎 実験マニュアル')
  })

  test('ライセンスの割当状況が表示される', async ({ page }) => {
    await expect(page.getByTestId('licenses-table')).toContainText('有効')
    await expect(page.getByTestId('licenses-table')).toContainText('田中 太郎')
  })

  test('ライセンスを作成・編集・削除できる', async ({ page }) => {
    const seats = 300 + (Date.now() % 100)
    const updatedSeats = seats + 1

    await page.getByTestId('license-add-button').click()
    await page.getByTestId('license-content').selectOption({ label: '物理基礎 実験マニュアル' })
    await page.getByTestId('license-seat-count').fill(String(seats))
    await page.getByTestId('license-status').selectOption('expired')
    await page.getByTestId('license-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText('「物理基礎 実験マニュアル」のライセンスを作成しました')
    const row = page.getByTestId('licenses-table').locator('tr').filter({ hasText: String(seats) })
    await expect(row).toContainText('物理基礎 実験マニュアル')
    await expect(row).toContainText('期限切れ')

    await row.getByRole('button', { name: '物理基礎 実験マニュアル のライセンスを編集' }).click()
    await expect(page.getByRole('heading', { name: 'ライセンス編集' })).toBeVisible()
    await page.getByTestId('license-seat-count').fill(String(updatedSeats))
    await page.getByTestId('license-status').selectOption('revoked')
    await page.getByTestId('license-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText('「物理基礎 実験マニュアル」のライセンスを更新しました')
    const updated = page.getByTestId('licenses-table').locator('tr').filter({ hasText: String(updatedSeats) })
    await expect(updated).toContainText('無効')

    await updated.getByRole('button', { name: '物理基礎 実験マニュアル のライセンスを削除' }).click()
    await confirmDelete(page)
    await expect(page.getByTestId('alert-success')).toContainText('「物理基礎 実験マニュアル」のライセンスを削除しました')
    await expect(page.getByTestId('licenses-table').locator('tr').filter({ hasText: String(updatedSeats) })).toHaveCount(0)
  })

  test('席数が不正なら送信前にエラーを表示する', async ({ page }) => {
    await page.getByTestId('license-add-button').click()
    await page.getByTestId('license-seat-count').fill('0')
    await page.getByTestId('license-submit').click()
    await expect(page.getByTestId('alert-error')).toContainText('席数は 1 以上を指定してください')
  })

  test('ライセンス削除をキャンセルすると残る', async ({ page }) => {
    const row = page.getByTestId('licenses-table').locator('tbody tr').first()
    const title = (await row.locator('td').first().innerText()).trim()

    await row.getByRole('button', { name: `${title} のライセンスを削除` }).click()
    await cancelDelete(page)
    await expect(page.getByTestId('licenses-table')).toContainText(title)
  })
})
