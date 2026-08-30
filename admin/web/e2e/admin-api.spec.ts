import { test, expect, ADMIN_TOKEN, LEARNER_TOKEN, INSTRUCTOR_TOKEN } from './fixtures'

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

  test('PUT /admin/contents/:id regenerates coverUrl when title changes', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/contents`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'Original Title',
        author: 'E2E',
        status: 'published',
        pageCount: 10,
      },
    })
    expect(create.status()).toBe(201)
    const created = await create.json()
    expect(created.coverUrl).toContain(encodeURIComponent('Original'))

    const update = await request.put(`${MOCK_API}/admin/contents/${created.id}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'Renamed Title',
        author: 'E2E',
      },
    })
    expect(update.ok()).toBeTruthy()
    const updated = await update.json()
    expect(updated.coverUrl).toContain(encodeURIComponent('Renamed'))
    expect(updated.coverUrl).not.toContain(encodeURIComponent('Original'))

    await request.delete(`${MOCK_API}/admin/contents/${created.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
  })

  test('POST /admin/contents uses coverTitle for thumbnail when provided', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/contents`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: '物理基礎 実験マニュアル',
        coverTitle: 'PhysLab',
        author: 'E2E',
        status: 'published',
        pageCount: 10,
      },
    })
    expect(create.status()).toBe(201)
    const created = await create.json()
    expect(created.coverTitle).toBe('PhysLab')
    expect(created.coverUrl).toContain(encodeURIComponent('PhysLab'))
    expect(created.coverUrl).not.toContain(encodeURIComponent('物理'))

    await request.delete(`${MOCK_API}/admin/contents/${created.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
  })

  test('learner cannot access admin endpoints', async ({ request }) => {
    const res = await request.get(`${MOCK_API}/admin/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.status()).toBe(403)
  })

  test('PUT /admin/users/:userId updates profile', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/users`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'E2E 更新前',
        email: `e2e-put-${Date.now()}@example.jp`,
        role: 'learner',
      },
    })
    expect(create.status()).toBe(201)
    const user = await create.json()

    const update = await request.put(`${MOCK_API}/admin/users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { name: 'E2E 更新後', role: 'instructor' },
    })
    expect(update.ok()).toBeTruthy()
    const updated = await update.json()
    expect(updated.name).toBe('E2E 更新後')
    expect(updated.role).toBe('instructor')

    await request.delete(`${MOCK_API}/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
  })

  test('cannot delete the signed-in admin user', async ({ request }) => {
    const res = await request.delete(`${MOCK_API}/admin/users/user-admin`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('cannot_delete_self')
  })

  test('POST /admin/licenses and DELETE lifecycle', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/licenses`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        contentId: 'content-003',
        seatCount: 7,
        status: 'expired',
        assignedUserIds: [],
      },
    })
    expect(create.status()).toBe(201)
    const license = await create.json()
    expect(license.seatCount).toBe(7)
    expect(license.status).toBe('expired')

    const update = await request.put(`${MOCK_API}/admin/licenses/${license.id}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { seatCount: 9, status: 'revoked' },
    })
    expect(update.ok()).toBeTruthy()
    const updated = await update.json()
    expect(updated.seatCount).toBe(9)
    expect(updated.status).toBe('revoked')

    const del = await request.delete(`${MOCK_API}/admin/licenses/${license.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(del.status()).toBe(204)
  })

  test('DELETE /admin/contents removes the content', async ({ request }) => {
    const create = await request.post(`${MOCK_API}/admin/contents`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: `E2E delete ${Date.now()}`,
        author: 'E2E',
        status: 'draft',
        pageCount: 3,
      },
    })
    expect(create.status()).toBe(201)
    const created = await create.json()

    const del = await request.delete(`${MOCK_API}/admin/contents/${created.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(del.status()).toBe(204)

    const list = await request.get(`${MOCK_API}/admin/contents`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    const body = await list.json()
    expect(body.data.some((c: { id: string }) => c.id === created.id)).toBe(false)
  })

  test('POST /admin/credentials and DELETE lifecycle', async ({ request }) => {
    const stamp = Date.now()
    const user = await request.post(`${MOCK_API}/admin/users`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `E2E cred ${stamp}`,
        email: `e2e-cred-api-${stamp}@example.jp`,
        role: 'learner',
      },
    })
    expect(user.status()).toBe(201)
    const createdUser = await user.json()
    const loginId = `e2eapi${stamp}`

    const create = await request.post(`${AUTH_API}/admin/credentials`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        loginId,
        password: 'pass1234',
        linkedUserId: createdUser.id,
      },
    })
    expect(create.status()).toBe(201)
    const credential = await create.json()
    expect(credential.loginId).toBe(loginId)

    const renamed = `e2eapirename${stamp}`
    const update = await request.put(`${AUTH_API}/admin/credentials/${loginId}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { newLoginId: renamed },
    })
    expect(update.ok()).toBeTruthy()
    expect((await update.json()).loginId).toBe(renamed)

    const del = await request.delete(`${AUTH_API}/admin/credentials/${renamed}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(del.status()).toBe(204)

    await request.delete(`${MOCK_API}/admin/users/${createdUser.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
  })

  test('cannot delete the default admin credential', async ({ request }) => {
    const res = await request.delete(`${AUTH_API}/admin/credentials/admin`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('cannot_delete')
  })

  test('PUT /admin/users/:userId/licenses affects viewer content list', async ({ request }) => {
    const learnerContents = await request.get(`${MOCK_API}/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(learnerContents.ok()).toBeTruthy()
    const before = await learnerContents.json()
    expect(before.data.length).toBeGreaterThanOrEqual(3)

    const update = await request.put(`${MOCK_API}/admin/users/user-001/licenses`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { licenseIds: ['license-001'] },
    })
    expect(update.ok()).toBeTruthy()

    const afterRes = await request.get(`${MOCK_API}/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    const after = await afterRes.json()
    expect(after.data).toHaveLength(1)
    expect(after.data[0].id).toBe('content-001')

    const instructorRes = await request.get(`${MOCK_API}/contents`, {
      headers: { Authorization: `Bearer ${INSTRUCTOR_TOKEN}` },
    })
    const instructor = await instructorRes.json()
    expect(instructor.data).toHaveLength(1)

    await request.put(`${MOCK_API}/admin/users/user-001/licenses`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { licenseIds: ['license-001', 'license-002', 'license-003'] },
    })
  })
})
