import { test, expect, loginAsAdmin, loginAsContentAdmin } from './fixtures'

test.describe('ロール別 UI 制御', () => {
  test('組織管理者は全ての書き込み操作が表示される', async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page.getByTestId('credential-add-button')).toBeVisible()
    await expect(page.getByTestId('user-add-button')).toBeVisible()

    await page.getByTestId('admin-nav-licenses').click()
    await expect(page.getByTestId('license-add-button')).toBeVisible()

    await page.getByTestId('admin-nav-contents').click()
    await expect(page.getByTestId('content-add-button')).toBeVisible()
  })

  test('コンテンツ管理者にはアカウントの書き込み操作が表示されない', async ({ page }) => {
    await loginAsContentAdmin(page)

    await expect(page.getByTestId('accounts-page')).toBeVisible()
    await expect(page.getByTestId('credential-add-button')).toHaveCount(0)
    await expect(page.getByTestId('user-add-button')).toHaveCount(0)
    await expect(page.getByTestId('alert-info')).toContainText('組織管理者権限が必要です')
  })

  test('コンテンツ管理者にはライセンスの書き込み操作が表示されない', async ({ page }) => {
    await loginAsContentAdmin(page)
    await page.getByTestId('admin-nav-licenses').click()

    await expect(page.getByTestId('licenses-page')).toBeVisible()
    await expect(page.getByTestId('license-add-button')).toHaveCount(0)
    await expect(page.getByTestId('alert-info')).toContainText('組織管理者権限が必要です')
  })

  test('コンテンツ管理者はコンテンツを作成できるが削除はできない', async ({ page }) => {
    await loginAsContentAdmin(page)
    await page.getByTestId('admin-nav-contents').click()

    await expect(page.getByTestId('contents-page')).toBeVisible()
    await expect(page.getByTestId('content-add-button')).toBeVisible()
    await expect(page.getByRole('button', { name: '編集' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '削除' })).toHaveCount(0)
  })
})

test.describe('管理画面のエラー表示', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('必須項目が未入力なら送信前にエラーを表示する', async ({ page }) => {
    await page.getByTestId('user-add-button').click()
    await page.getByTestId('user-submit').click()

    await expect(page.getByTestId('alert-error')).toContainText('名前を入力してください')
  })

  test('API がエラーを返したら画面にエラーを表示する', async ({ page }) => {
    await page.route('**/admin/users', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'validation_error', message: 'メールアドレスが重複しています' }),
        })
        return
      }
      await route.continue()
    })

    await page.getByTestId('user-add-button').click()
    await page.locator('input[placeholder="名前"]').fill('E2E ユーザー')
    await page.locator('input[placeholder="メールアドレス"]').fill('dup@example.com')
    await page.getByTestId('user-submit').click()

    await expect(page.getByTestId('alert-error')).toContainText('メールアドレスが重複しています')
  })

  test('作成に成功したら成功メッセージを表示する', async ({ page }) => {
    const name = `E2E ユーザー ${Date.now()}`
    await page.getByTestId('user-add-button').click()
    await page.locator('input[placeholder="名前"]').fill(name)
    await page.locator('input[placeholder="メールアドレス"]').fill(`e2e-${Date.now()}@example.com`)
    await page.getByTestId('user-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`「${name}」を作成しました`)
    await expect(page.getByTestId('users-table')).toContainText(name)

    // 後続の実行で seed に残らないよう後片付けする
    await page.getByTestId('users-table').locator('tr').filter({ hasText: name })
      .getByRole('button').last().click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('confirm-dialog-confirm').click()
    await expect(page.getByTestId('alert-success')).toContainText(`「${name}」を削除しました`)
  })
})
