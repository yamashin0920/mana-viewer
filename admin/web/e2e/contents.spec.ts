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

  test('コンテンツを編集できる', async ({ page }) => {
    const stamp = Date.now()
    const title = `E2E 編集前 ${stamp}`
    const renamed = `E2E 編集後 ${stamp}`

    await page.getByTestId('content-add-button').click()
    await page.getByTestId('content-title-input').fill(title)
    await page.locator('#content-author').fill('E2E')
    await page.locator('#content-status').selectOption('draft')
    await page.getByTestId('content-submit').click()
    await expect(page.getByTestId('alert-success')).toContainText(`「${title}」を作成しました`)

    const card = page.getByTestId('contents-grid').locator('> div').filter({ hasText: title })
    await card.getByRole('button', { name: '編集' }).click()
    await expect(page.getByRole('heading', { name: 'コンテンツ編集' })).toBeVisible()
    await page.getByTestId('content-title-input').fill(renamed)
    await page.locator('#content-status').selectOption('published')
    await page.getByTestId('content-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`「${renamed}」を更新しました`)
    const updated = page.getByTestId('contents-grid').locator('> div').filter({ hasText: renamed })
    await expect(updated).toBeVisible()
    await expect(updated).toContainText('公開')
    await expect(page.getByTestId('contents-grid')).not.toContainText(title)

    await updated.getByRole('button', { name: '削除' }).click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('confirm-dialog-confirm').click()
    await expect(page.getByTestId('alert-success')).toContainText(`「${renamed}」を削除しました`)
  })

  test('コンテンツ削除をキャンセルすると残る', async ({ page }) => {
    const card = page.getByTestId('contents-grid').locator('> div').first()
    const title = (await card.locator('h3').innerText()).trim()

    await card.getByRole('button', { name: '削除' }).click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('confirm-dialog-cancel').click()
    await expect(page.getByTestId('confirm-dialog')).toBeHidden()
    await expect(page.getByTestId('contents-grid')).toContainText(title)
  })

  test('タイトル未入力なら送信前にエラーを表示する', async ({ page }) => {
    await page.getByTestId('content-add-button').click()
    await page.getByTestId('content-submit').click()
    await expect(page.getByTestId('alert-error')).toContainText('タイトルを入力してください')
  })
})
