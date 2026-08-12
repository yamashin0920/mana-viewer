import { test, expect, API_BASE, LEARNER_TOKEN, openFirstContent } from './fixtures'

test.describe('読書進捗', () => {
  test('保存済みの進捗がビューア起動時に復元される', async ({ page, request }) => {
    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPage: 4,
        progressPercent: 1.6,
        zoom: 1.3,
        viewMode: 'single',
      },
    })

    await openFirstContent(page)
    await expect(page.getByTestId('page-input')).toHaveValue('4', { timeout: 15_000 })
    await expect(page.getByText('130%')).toBeVisible()

    await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPage: 1,
        progressPercent: 0.4,
        zoom: 1.2,
        viewMode: 'single',
      },
    })
  })
})
