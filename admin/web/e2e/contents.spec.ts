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
    const stamp = Date.now()
    const title = `E2E 表紙テスト ${stamp}`
    // 表紙ラベルは API 側で 10 文字に切り詰められるため収まる長さにする
    const coverTitle = `Cover${stamp % 100000}`
    await page.getByTestId('content-add-button').click()
    await page.getByTestId('content-title-input').fill(title)
    await page.getByTestId('cover-title-input').fill(coverTitle)
    await page.locator('#content-author').fill('E2E')
    await page.locator('#content-status').selectOption('published')
    await page.getByTestId('content-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`「${title}」を作成しました`)

    // 作成したカードだけを対象にする（seed が永続化されるため一意な値で絞り込む）
    const card = page.getByTestId('contents-grid').locator('> div').filter({ hasText: title })
    await expect(card.locator(`img[src*="${coverTitle}"]`)).toBeVisible()

    // 後続の実行で seed に残らないよう後片付けする
    await card.getByRole('button', { name: '削除' }).click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('confirm-dialog-confirm').click()
    await expect(page.getByTestId('alert-success')).toContainText(`「${title}」を削除しました`)
  })
})
