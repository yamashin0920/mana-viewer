import { test, expect, openFirstContent, expandViewerTools } from './fixtures'

test.describe('ツールバーの部品配置と展開', () => {
  test('広い画面では二次ツールが最初から並ぶ', async ({ page }) => {
    await openFirstContent(page)
    await expect(page.getByTestId('viewer-secondary-controls-toggle')).toBeHidden()
    await expect(page.getByTestId('annotation-tools')).toBeVisible()
    await expect(page.getByTestId('zoom-in')).toBeVisible()
    await expect(page.getByTestId('view-mode-spread')).toBeVisible()
  })

  test('狭い画面ではツールを押すと二次操作が展開する', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 })
    await openFirstContent(page)

    const toggle = page.getByTestId('viewer-secondary-controls-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('annotation-tools')).toBeHidden()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('annotation-tools')).toBeVisible()
    await expect(page.getByTestId('zoom-in')).toBeVisible()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('annotation-tools')).toBeHidden()
  })

  test('展開後にズームできる', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 })
    await openFirstContent(page)
    await expandViewerTools(page)

    const level = page.getByTestId('zoom-level')
    const before = Number((await level.textContent())!.replace('%', ''))
    await page.getByTestId('zoom-in').click()
    await expect(level).toHaveText(`${before + 10}%`)
  })
})
