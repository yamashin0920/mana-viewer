import { test, expect, loginAsAdmin, confirmDelete, cancelDelete } from './fixtures'

test.describe('アカウント管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('ログインアカウント一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('credentials-table')).toBeVisible()
    await expect(page.getByTestId('credentials-table')).toContainText('demo')
    await expect(page.getByTestId('credentials-table')).toContainText('admin')
  })

  test('ユーザー一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toBeVisible()
    await expect(page.getByTestId('users-table')).toContainText('田中 太郎')
    await expect(page.getByTestId('users-table')).toContainText('管理者')
  })

  test('ユーザーに割当ライセンスが表示される', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toContainText('数学I 基礎テキスト')
  })

  test('ユーザーのライセンス割当を変更できる', async ({ page }) => {
    await page.getByTestId('user-licenses-user-001').click()
    await expect(page.getByTestId('user-licenses-form')).toBeVisible()

    const englishCheckbox = page.getByTestId('user-licenses-form').getByRole('checkbox', { name: /英語コミュニケーションI/ })
    await englishCheckbox.uncheck()
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByTestId('user-licenses-form')).not.toBeVisible()
    await expect(page.getByTestId('users-table')).not.toContainText('英語コミュニケーションI')

    await page.getByTestId('user-licenses-user-001').click()
    await page.getByTestId('user-licenses-form').getByRole('checkbox', { name: /英語コミュニケーションI/ }).check()
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByTestId('users-table')).toContainText('英語コミュニケーションI')
  })

  test('ユーザーを作成・編集・削除できる', async ({ page }) => {
    const stamp = Date.now()
    const name = `E2E ユーザー ${stamp}`
    const renamed = `E2E 改名 ${stamp}`
    const email = `e2e-user-${stamp}@example.jp`

    await page.getByTestId('user-add-button').click()
    await page.getByTestId('user-name').fill(name)
    await page.getByTestId('user-email').fill(email)
    await page.getByTestId('user-role').selectOption('instructor')
    await page.getByTestId('user-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`「${name}」を作成しました`)
    const row = page.getByTestId('users-table').locator('tr').filter({ hasText: name })
    await expect(row).toContainText(email)
    await expect(row).toContainText('教員')

    await page.getByRole('button', { name: `${name} を編集` }).click()
    await expect(page.getByRole('heading', { name: 'ユーザー編集' })).toBeVisible()
    await page.getByTestId('user-name').fill(renamed)
    await page.getByTestId('user-role').selectOption('learner')
    await page.getByTestId('user-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`「${renamed}」を更新しました`)
    await expect(page.getByTestId('users-table')).toContainText(renamed)
    await expect(page.getByTestId('users-table')).not.toContainText(name)
    await expect(page.getByTestId('users-table').locator('tr').filter({ hasText: renamed })).toContainText('学習者')

    await page.getByRole('button', { name: `${renamed} を削除` }).click()
    await confirmDelete(page)
    await expect(page.getByTestId('alert-success')).toContainText(`「${renamed}」を削除しました`)
    await expect(page.getByTestId('users-table')).not.toContainText(renamed)
  })

  test('ユーザー削除をキャンセルすると残る', async ({ page }) => {
    const name = (await page.getByTestId('users-table').locator('tbody tr').first().locator('td').first().innerText()).trim()

    await page.getByRole('button', { name: `${name} を削除` }).click()
    await cancelDelete(page)
    await expect(page.getByTestId('users-table')).toContainText(name)
  })

  test('ログインアカウントを作成・編集・削除できる', async ({ page }) => {
    const stamp = Date.now()
    const userName = `E2E 資格 ${stamp}`
    const loginId = `e2e${stamp}`
    const renamedLoginId = `e2erename${stamp}`

    await page.getByTestId('user-add-button').click()
    await page.getByTestId('user-name').fill(userName)
    await page.getByTestId('user-email').fill(`e2e-cred-${stamp}@example.jp`)
    await page.getByTestId('user-submit').click()
    await expect(page.getByTestId('alert-success')).toContainText(`「${userName}」を作成しました`)

    await page.getByTestId('credential-add-button').click()
    await page.getByTestId('credential-login-id').fill(loginId)
    await page.getByTestId('credential-password').fill('pass1234')
    const linkedUserValue = await page
      .getByTestId('credential-linked-user')
      .locator('option')
      .filter({ hasText: userName })
      .getAttribute('value')
    expect(linkedUserValue).toBeTruthy()
    await page.getByTestId('credential-linked-user').selectOption(linkedUserValue!)
    await page.getByTestId('credential-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`ログインID「${loginId}」を作成しました`)
    await expect(page.getByTestId('credentials-table')).toContainText(loginId)
    await expect(page.getByTestId('credentials-table')).toContainText(userName)

    await page.getByRole('button', { name: `${loginId} を編集` }).click()
    await expect(page.getByRole('heading', { name: 'ログインアカウント編集' })).toBeVisible()
    await page.getByTestId('credential-login-id').fill(renamedLoginId)
    await page.getByTestId('credential-submit').click()

    await expect(page.getByTestId('alert-success')).toContainText(`ログインID「${renamedLoginId}」を更新しました`)
    await expect(page.getByTestId('credentials-table')).toContainText(renamedLoginId)
    await expect(page.getByTestId('credentials-table')).not.toContainText(loginId)

    await page.getByRole('button', { name: `${renamedLoginId} を削除` }).click()
    await confirmDelete(page)
    await expect(page.getByTestId('alert-success')).toContainText(`ログインID「${renamedLoginId}」を削除しました`)
    await expect(page.getByTestId('credentials-table')).not.toContainText(renamedLoginId)

    await page.getByRole('button', { name: `${userName} を削除` }).click()
    await confirmDelete(page)
    await expect(page.getByTestId('users-table')).not.toContainText(userName)
  })

  test('ログインアカウント作成で必須項目が空ならエラーを表示する', async ({ page }) => {
    await page.getByTestId('credential-add-button').click()
    await page.getByTestId('credential-submit').click()
    await expect(page.getByTestId('alert-error')).toContainText('ログインIDを入力してください')
  })

  test('ログインアカウント削除をキャンセルすると残る', async ({ page }) => {
    const loginId = (await page.getByTestId('credentials-table').locator('tbody tr').first().locator('td').first().innerText()).trim()

    await page.getByRole('button', { name: `${loginId} を削除` }).click()
    await cancelDelete(page)
    await expect(page.getByTestId('credentials-table')).toContainText(loginId)
  })
})
