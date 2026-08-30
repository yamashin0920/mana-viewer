import { test, expect, openFirstContent } from './fixtures'

test.describe('ダイアログのアクセシビリティ', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstContent(page)
  })

  test('ダイアログが role=dialog / aria-modal を持ちタイトルと紐づく', async ({ page }) => {
    await page.getByLabel('メモ追加').click()

    const dialog = page.getByTestId('modal')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    const labelledBy = await dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    // useId が生成する ID はコロンを含むため属性セレクタで参照する
    await expect(page.locator(`[id="${labelledBy}"]`)).toHaveText('メモを追加')
  })

  test('ダイアログを開くと内部にフォーカスが移る', async ({ page }) => {
    await page.getByLabel('メモ追加').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    const focusedInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="modal"]')
      return !!dialog && dialog.contains(document.activeElement)
    })
    expect(focusedInsideDialog).toBe(true)
  })

  test('Tab キーでフォーカスがダイアログ外へ出ない', async ({ page }) => {
    await page.getByLabel('メモ追加').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => {
        const dialog = document.querySelector('[data-testid="modal"]')
        return !!dialog && dialog.contains(document.activeElement)
      })
      expect(inside).toBe(true)
    }
  })

  test('Escape で閉じるとフォーカスが元の要素へ戻る', async ({ page }) => {
    const trigger = page.getByLabel('メモ追加')
    await trigger.click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('modal')).toBeHidden()

    await expect(trigger).toBeFocused()
  })
})

test.describe('トーストのアクセシビリティ', () => {
  test('トーストがライブリージョンとして通知される', async ({ page }) => {
    await openFirstContent(page)

    const liveRegion = page.locator('[role="log"][aria-live="polite"]')
    await expect(liveRegion).toBeAttached()

    await page.getByRole('banner').getByRole('button', { name: 'ブックマーク' }).click()

    const toast = page.getByTestId('toast').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('role', 'status')
  })

  test('エラートーストは role=alert で通知される', async ({ page }) => {
    await openFirstContent(page)

    await page.route('**/contents/*/annotations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'server_error', message: 'failed' }),
        })
        return
      }
      await route.continue()
    })

    await page.getByRole('banner').getByRole('button', { name: 'ブックマーク' }).click()

    const toast = page.getByTestId('toast').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('role', 'alert')
  })
})

test.describe('モバイルドロワーのアクセシビリティ', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('ドロワーが dialog として扱われ Escape で閉じる', async ({ page }) => {
    await openFirstContent(page)
    await page.getByTestId('mobile-sidebar-toggle').click()

    const drawer = page.getByTestId('mobile-sidebar-drawer')
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveAttribute('role', 'dialog')
    await expect(drawer).toHaveAttribute('aria-modal', 'true')

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  })
})
