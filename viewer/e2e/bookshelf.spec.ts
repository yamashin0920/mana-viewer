import { test, expect, gotoBookshelf } from './fixtures'

test.describe('本棚ページ', () => {
  test('教材一覧が表示される', async ({ page }) => {
    await gotoBookshelf(page)

    await expect(page.getByRole('heading', { name: '本棚' })).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(3)
    await expect(page.getByTestId('content-grid').getByText('数学I 基礎テキスト')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByText('英語コミュニケーションI')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByText('物理基礎 実験マニュアル')).toBeVisible()
  })

  test('最近読んだものセクションが表示される', async ({ page }) => {
    await gotoBookshelf(page)

    const section = page.getByTestId('recently-read-section')
    await expect(section).toBeVisible()
    await expect(section.getByText('最近読んだもの')).toBeVisible()
    await expect(section.getByTestId('content-card').first()).toBeVisible()
  })

  test('教材名で検索できる', async ({ page }) => {
    await gotoBookshelf(page)

    await page.getByTestId('search-input').fill('数学')
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(1)

    await page.getByTestId('search-input').fill('存在しない教材')
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(0)
    await expect(page.getByText('教材が見つかりません')).toBeVisible()
  })

  test('カテゴリフィルタが機能する', async ({ page }) => {
    await gotoBookshelf(page)

    await page.getByTestId('category-filter-数学').click()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(1)

    await page.getByTestId('category-filter-英語').click()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(1)

    await page.getByTestId('category-filter-all').click()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(3)
  })

  test('教材カードをクリックするとビューアに遷移する', async ({ page }) => {
    await gotoBookshelf(page)

    await page.getByTestId('content-grid').getByRole('link', { name: /数学I 基礎テキスト/ }).first().click()
    await expect(page).toHaveURL(/\/viewer\/content-001/)
    await expect(page.getByTestId('viewer-page')).toBeVisible()
  })

  test('開発用ユーザーを切り替えられる', async ({ page }) => {
    await gotoBookshelf(page)

    await page.getByLabel('開発用ユーザー切替').selectOption('mock-token-instructor')
    await expect(page.getByText('鈴木 花子')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(1)
    await expect(page.getByTestId('content-grid').getByText('数学I 基礎テキスト')).toBeVisible()

    await page.getByLabel('開発用ユーザー切替').selectOption('mock-token-learner')
    await expect(page.getByText('田中 太郎')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card')).toHaveCount(3)
  })
})
