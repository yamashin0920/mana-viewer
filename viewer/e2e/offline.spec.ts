import { test, expect, openFirstContent, waitForPdfRender } from './fixtures'

test.describe('オフライン・キャッシュ', () => {
  test('教材メタデータが IndexedDB にキャッシュされる', async ({ page }) => {
    await openFirstContent(page)

    const cached = await page.evaluate(async () => {
      const dbRequest = indexedDB.open('mana-viewer-offline')
      return new Promise<{ id: string } | null>((resolve, reject) => {
        dbRequest.onerror = () => reject(dbRequest.error)
        dbRequest.onsuccess = () => {
          const db = dbRequest.result
          const tx = db.transaction('contents', 'readonly')
          const store = tx.objectStore('contents')
          const getReq = store.get('content-001')
          getReq.onsuccess = () => resolve(getReq.result ?? null)
          getReq.onerror = () => reject(getReq.error)
        }
      })
    })

    expect(cached).toBeTruthy()
    expect(cached?.id).toBe('content-001')
  })

  test('進捗 API 失敗時にオフラインキューへ保存される', async ({ page }) => {
    await openFirstContent(page)
    await waitForPdfRender(page)

    await page.route('**/api/contents/content-001/progress', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 503, body: 'Service Unavailable' })
        return
      }
      route.continue()
    })

    const pageInput = page.getByTestId('page-input')
    const initial = Number(await pageInput.inputValue())
    await page.getByLabel('次のページ').click()
    await expect(pageInput).toHaveValue(String(initial + 1))

    await page.waitForTimeout(1500)

    const queued = await page.evaluate(async () => {
      const dbRequest = indexedDB.open('mana-viewer-offline')
      return new Promise<number>((resolve, reject) => {
        dbRequest.onerror = () => reject(dbRequest.error)
        dbRequest.onsuccess = () => {
          const db = dbRequest.result
          const tx = db.transaction('progressQueue', 'readonly')
          const store = tx.objectStore('progressQueue')
          const getAllReq = store.getAll()
          getAllReq.onsuccess = () => {
            const pending = getAllReq.result.filter(
              (item: { contentId: string; synced: boolean }) =>
                item.contentId === 'content-001' && !item.synced
            )
            resolve(pending.length)
          }
          getAllReq.onerror = () => reject(getAllReq.error)
        }
      })
    })

    expect(queued).toBeGreaterThan(0)
  })
})
