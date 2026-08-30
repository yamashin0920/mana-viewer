import { test, expect, openFirstContent, setPage, expandViewerTools } from './fixtures'

test.describe('モバイル表示', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('FABからサイドバーを開ける', async ({ page }) => {
    await openFirstContent(page)

    await expect(page.getByTestId('desktop-sidebar')).toBeHidden()
    await page.getByTestId('mobile-sidebar-toggle').click()
    await expect(page.getByTestId('mobile-sidebar-drawer')).toBeVisible()
    await page.getByTestId('mobile-sidebar-drawer').getByTestId('sidebar-tab-annotations').click()
    await expect(page.getByTestId('mobile-sidebar-drawer').getByText(/p\.\d+ · マーカー|p\.\d+ · ブックマーク/).first()).toBeVisible()
  })

  test('モバイルツールバーでページ移動できる', async ({ page }) => {
    await openFirstContent(page)
    await setPage(page, 2)

    await page.getByLabel('次のページ').click()
    await expect(page.getByTestId('page-input')).toHaveValue('3')
  })

  test('二次ツールはトレイを開くまで隠れている', async ({ page }) => {
    await openFirstContent(page)
    await expect(page.getByTestId('viewer-secondary-controls-toggle')).toBeVisible()
    await expect(page.getByTestId('annotation-tools')).toBeHidden()
    await page.getByTestId('viewer-secondary-controls-toggle').click()
    await expect(page.getByTestId('annotation-tools')).toBeVisible()
  })

  test('本棚がモバイルで表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('bookshelf-page')).toBeVisible()
    await expect(page.getByTestId('content-grid').getByTestId('content-card').first()).toBeVisible()
    await expect(page.getByTestId('search-input')).toBeVisible()
  })
})

test.describe('モバイルでも使える操作', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await openFirstContent(page)
    await expandViewerTools(page)
  })

  test('ズームコントロールが表示され操作できる', async ({ page }) => {
    const level = page.getByTestId('zoom-level')
    await expect(level).toBeVisible()
    const before = Number((await level.textContent())!.replace('%', ''))

    await page.getByTestId('zoom-in').click()
    await expect(level).toHaveText(`${before + 10}%`)

    await page.getByTestId('zoom-out').click()
    await expect(level).toHaveText(`${before}%`)
  })

  test('マーカーの色を変更できる', async ({ page }) => {
    await page.getByTestId('annotation-tool-marker').click()

    const picker = page.getByTestId('marker-color-picker')
    await expect(picker).toBeVisible()

    const green = picker.getByTestId('marker-color-green')
    await green.click()
    await expect(green).toHaveAttribute('aria-pressed', 'true')
  })

  test('ペンの色を変更できる', async ({ page }) => {
    await page.getByTestId('annotation-tool-pen').click()

    const picker = page.getByTestId('pen-color-picker')
    await expect(picker).toBeVisible()

    const blue = picker.getByTestId('pen-color-blue')
    await blue.click()
    await expect(blue).toHaveAttribute('aria-pressed', 'true')
  })

  test('見開き切替が表示される', async ({ page }) => {
    await expect(page.getByTestId('view-mode-spread')).toBeVisible()
    await page.getByTestId('view-mode-spread').click()
    await expect(page.locator('[data-testid="pdf-canvas"]')).toHaveCount(2)
  })

  test('検索中でもページ送りと注釈ツールが使える', async ({ page }) => {
    await page.getByTestId('search-toggle').click()
    await expect(page.getByTestId('search-bar')).toBeVisible()

    // 検索を開いてもツールバーの他の操作は残る
    await expect(page.getByTestId('page-input')).toBeVisible()
    await expect(page.getByTestId('annotation-tools')).toBeVisible()

    await setPage(page, 2)
    await page.getByLabel('次のページ').click()
    await expect(page.getByTestId('page-input')).toHaveValue('3')
  })

  test('ピンチ操作で拡大できる', async ({ page }) => {
    const level = page.getByTestId('zoom-level')
    const before = Number((await level.textContent())!.replace('%', ''))

    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="pdf-scroll-area"]')!
      const touch = (identifier: number, clientX: number) =>
        new Touch({ identifier, target: el, clientX, clientY: 400 })
      const fire = (type: string, xs: number[], cancelable = false) =>
        el.dispatchEvent(
          new TouchEvent(type, {
            touches: xs.map((x, i) => touch(i, x)),
            bubbles: true,
            cancelable,
          })
        )
      fire('touchstart', [150, 250])
      fire('touchmove', [100, 300], true)
      fire('touchend', [])
    })

    // 100px → 200px に広げたので約 2 倍（上限 250% でクランプ）
    await expect(level).not.toHaveText(`${before}%`)
    const after = Number((await level.textContent())!.replace('%', ''))
    expect(after).toBeGreaterThan(before)
  })
})
