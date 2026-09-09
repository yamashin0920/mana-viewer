import { test, expect, loginAsAdmin } from './fixtures'

test.describe('コンテンツ管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByTestId('admin-nav-contents').click()
    await expect(page.getByTestId('contents-page')).toBeVisible()
  })

  test('コンテンツ一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('contents-grid')).toBeVisible()
    await expect(page.getByTestId('contents-grid')).toContainText('数学I 基礎テキスト')
    await expect(page.getByTestId('contents-grid')).toContainText('英語コミュニケーションI')
    await expect(page.getByTestId('contents-grid')).toContainText('物理基礎 実験マニュアル')
  })

  test('公開ステータスが表示される', async ({ page }) => {
    await expect(page.getByTestId('contents-grid')).toContainText('公開')
  })

  test('表紙用タイトルを入力してコンテンツを作成できる', async ({ page }) => {
    const title = `E2E 表紙テスト ${Date.now()}`
    await page.getByRole('button', { name: 'コンテンツ追加' }).click()
    await page.getByTestId('content-title-input').fill(title)
    await page.getByTestId('cover-title-input').fill('CoverTest')
    await page.locator('#content-author').fill('E2E')
    await page.locator('#content-status').selectOption('published')
    await page.getByRole('button', { name: '作成' }).click()

    await expect(page.getByTestId('contents-grid')).toContainText(title)
    await expect(page.getByTestId('contents-grid').locator(`img[src*="CoverTest"]`)).toBeVisible()
  })

  test('コンテンツカードに印刷OK/NGが表示される', async ({ page }) => {
    await expect(page.getByTestId('content-card-content-001').getByTestId('print-badge')).toHaveText('印刷NG')
    await expect(page.getByTestId('content-card-content-003').getByTestId('print-badge')).toHaveText('印刷OK')
  })

  test('印刷OK/NGを切り替えて保存できる', async ({ page }) => {
    await page.getByTestId('content-card-content-001').getByRole('button', { name: '編集' }).click()
    await expect(page.getByTestId('print-policy')).toBeVisible()
    await page.getByTestId('print-policy-ok').click()
    await page.getByRole('button', { name: '更新' }).click()
    await expect(page.getByTestId('content-card-content-001').getByTestId('print-badge')).toHaveText('印刷OK')

    await page.getByTestId('content-card-content-001').getByRole('button', { name: '編集' }).click()
    await page.getByTestId('print-policy-ng').click()
    await page.getByRole('button', { name: '更新' }).click()
    await expect(page.getByTestId('content-card-content-001').getByTestId('print-badge')).toHaveText('印刷NG')
  })
})