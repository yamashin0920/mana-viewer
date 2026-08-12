import { test, expect, ADMIN_TOKEN, LEARNER_TOKEN } from './fixtures'

const AUTH_API = 'http://localhost:3002'
const MOCK_API = 'http://localhost:3001'

test.describe('Admin API', () => {
  test('GET /admin/credentials requires admin auth', async ({ request }) => {
    const unauth = await request.get(`${AUTH_API}/admin/credentials`)
    expect(unauth.status()).toBe(401)

    const learner = await request.get(`${AUTH_API}/admin/credentials`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(learner.status()).toBe(403)

    const admin = await request.get(`${AUTH_API}/admin/credentials`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(admin.ok()).toBeTruthy()
    const body = await admin.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    expect(body.data[0]).toHaveProperty('loginId')
    expect(body.data[0]).toHaveProperty('linkedUser')
  })

  test('GET /admin/users returns org members with licenses', async ({ request }) => {
    const res = await request.get(`${MOCK_API}/admin/users`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    const learner = body.data.find((u: { id: string }) => u.id === 'user-001')
    expect(learner.licenses.length).toBeGreaterThan(0)
  })

  test('GET /admin/licenses returns license list', async ({ request }) => {
    const res = await request.get(`${MOCK_API}/admin/licenses`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    expect(body.data[0]).toHaveProperty('content')
    expect(body.data[0]).toHaveProperty('seatsUsed')
  })

  test('GET /admin/contents returns all org contents', async ({ request }) => {
    const res = await request.get(`${MOCK_API}/admin/contents`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    expect(body.data[0]).toHaveProperty('policy')
  })

  test('POST /admin/users and DELETE lifecycle', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/users`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'E2E テストユーザー',
        email: `e2e-${Date.now()}@example.jp`,
        role: 'learner',
      },
    })
    expect(create.status()).toBe(201)
    const user = await create.json()

    const del = await request.delete(`${MOCK_API}/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(del.status()).toBe(204)
  })

  test('learner cannot access admin endpoints', async ({ request }) => {
    const res = await request.get(`${MOCK_API}/admin/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.status()).toBe(403)
  })
})
