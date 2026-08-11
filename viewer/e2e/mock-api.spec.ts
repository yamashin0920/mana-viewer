import { test, expect, LEARNER_TOKEN } from './fixtures'

const API_BASE = 'http://localhost:3001'

test.describe('Mock API', () => {
  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('manabu-kun-mock-api')
  })

  test('GET /contents requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents`)
    expect(res.status()).toBe(401)
  })

  test('GET /contents returns licensed content for learner', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    expect(body.data[0]).toHaveProperty('title')
    expect(body.data[0]).toHaveProperty('policy')
  })

  test('POST /licenses/verify allows viewing content-001', async ({ request }) => {
    const res = await request.post(`${API_BASE}/licenses/verify`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { contentId: 'content-001', action: 'view' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.canView).toBe(true)
    expect(body.canDownloadOffline).toBe(true)
  })

  test('GET /bookshelves returns distributed shelf', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bookshelves`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const distributed = body.data.find((s: { type: string }) => s.type === 'distributed')
    expect(distributed).toBeTruthy()
    expect(distributed.items.length).toBeGreaterThan(0)
  })

  test('POST /contents/:id/view-sessions creates session', async ({ request }) => {
    const res = await request.post(`${API_BASE}/contents/content-001/view-sessions`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.sessionToken).toBeTruthy()
    expect(body.pageCount).toBeGreaterThan(0)
  })

  test('GET /contents/:id/annotations returns seed data', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001/annotations`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('POST and DELETE annotation lifecycle', async ({ request }) => {
    const note = `Playwright test ${Date.now()}`
    const createRes = await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'bookmark',
        page: 1,
        note,
      },
    })
    expect(createRes.status()).toBe(201)
    const created = await createRes.json()
    expect(created.id).toBeTruthy()

    const listRes = await request.get(`${API_BASE}/contents/content-001/annotations`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    const list = await listRes.json()
    expect(list.data.some((a: { id: string }) => a.id === created.id)).toBe(true)

    const deleteRes = await request.delete(`${API_BASE}/annotations/${created.id}`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(deleteRes.status()).toBe(204)
  })

  test('PUT /contents/:id/progress saves reading progress', async ({ request }) => {
    const res = await request.put(`${API_BASE}/contents/content-001/progress`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPage: 5,
        progressPercent: 2.0,
        zoom: 1.2,
        viewMode: 'single',
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.currentPage).toBe(5)
  })
})
