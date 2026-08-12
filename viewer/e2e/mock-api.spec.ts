import { test, expect, LEARNER_TOKEN, INSTRUCTOR_TOKEN, ADMIN_TOKEN, API_BASE } from './fixtures'

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

test.describe('Mock API', () => {
  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('mana-viewer-mock-api')
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

  test('POST /auth/login moved to auth-api', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: { userId: 'anyone', password: 'anything' },
    })
    expect(res.status()).toBe(410)
  })

  test('POST /contents/:id/annotations/share creates share link', async ({ request }) => {
    const res = await request.post(`${API_BASE}/contents/content-001/annotations/share`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { expiresInDays: 7 },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.shareId).toBeTruthy()
    expect(body.shareUrl).toContain('?share=')
    expect(body.annotationCount).toBeGreaterThan(0)
    expect(body.expiresAt).toBeTruthy()
  })

  test('GET /annotations/shared/:shareId returns shared bundle', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/contents/content-001/annotations/share`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {},
    })
    const created = await createRes.json()

    const getRes = await request.get(`${API_BASE}/annotations/shared/${created.shareId}`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(getRes.ok()).toBeTruthy()
    const bundle = await getRes.json()
    expect(bundle.contentId).toBe('content-001')
    expect(bundle.annotations.length).toBe(created.annotationCount)
  })

  test('GET /users/me returns profile with organization', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.name).toBe('田中 太郎')
    expect(body.role).toBe('learner')
    expect(body.organization.name).toBe('東京学習高等学校')
  })

  test('GET /licenses/me returns user licenses', async ({ request }) => {
    const res = await request.get(`${API_BASE}/licenses/me`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty('contentId')
    expect(body.data[0].content).toHaveProperty('title')
  })

  test('POST /licenses/verify denies content without license', async ({ request }) => {
    const res = await request.post(`${API_BASE}/licenses/verify`, {
      headers: authHeaders(ADMIN_TOKEN),
      data: { contentId: 'content-001', action: 'view' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.canView).toBe(false)
    expect(body.allowed).toBe(false)
  })

  test('POST /licenses/offline-token issues token for registered device', async ({ request }) => {
    const res = await request.post(`${API_BASE}/licenses/offline-token`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { contentId: 'content-001', deviceId: 'device-001' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.offlineToken).toMatch(/^offline-/)
    expect(body.contentId).toBe('content-001')
    expect(body.expiresAt).toBeTruthy()
  })

  test('GET /contents/:id returns detail with toc', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.title).toBe('数学I 基礎テキスト')
    expect(body.toc.length).toBeGreaterThan(0)
  })

  test('GET /contents/:id/policy returns drm settings', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001/policy`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.watermark).toContain('東京学習高等学校')
    expect(body.drm.allowCopy).toBe(false)
    expect(body.drm.allowScreenshot).toBe(false)
  })

  test('GET /contents/:id/toc returns table of contents', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001/toc`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.contentId).toBe('content-001')
    expect(body.toc.length).toBeGreaterThan(0)
  })

  test('GET /contents/:id/chunks/:page returns encrypted chunk with session', async ({ request }) => {
    const sessionRes = await request.post(`${API_BASE}/contents/content-001/view-sessions`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    const session = await sessionRes.json()

    const chunkRes = await request.get(`${API_BASE}/contents/content-001/chunks/1`, {
      headers: {
        Authorization: `Bearer ${LEARNER_TOKEN}`,
        'X-Session-Token': session.sessionToken,
      },
    })
    expect(chunkRes.ok()).toBeTruthy()
    expect(chunkRes.headers()['x-encrypted']).toBe('true')
    const buffer = await chunkRes.body()
    expect(buffer.length).toBeGreaterThan(0)
  })

  test('GET /contents/:id/chunks/:page requires session token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001/chunks/1`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /contents/:id/progress returns reading progress', async ({ request }) => {
    const res = await request.get(`${API_BASE}/contents/content-001/progress`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.contentId).toBe('content-001')
    expect(body).toHaveProperty('currentPage')
  })

  test('POST /contents/:id/progress/sync merges offline queue items', async ({ request }) => {
    const res = await request.post(`${API_BASE}/contents/content-001/progress/sync`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: {
        items: [{ currentPage: 8, progressPercent: 3.2, zoom: 1.1, viewMode: 'single' }],
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.synced.length).toBe(1)
    expect(body.synced[0].currentPage).toBe(8)
  })

  test('PUT /annotations/:id updates annotation', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/contents/content-001/annotations`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { type: 'bookmark', page: 2, note: 'before update' },
    })
    const created = await createRes.json()

    const updateRes = await request.put(`${API_BASE}/annotations/${created.id}`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { note: 'after update', color: '#FFEB3B' },
    })
    expect(updateRes.ok()).toBeTruthy()
    const updated = await updateRes.json()
    expect(updated.note).toBe('after update')
    expect(updated.color).toBe('#FFEB3B')
  })

  test('POST /contents/:id/annotations/sync merges client changes', async ({ request }) => {
    const clientId = `client-ann-${Date.now()}`
    const res = await request.post(`${API_BASE}/contents/content-001/annotations/sync`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: {
        items: [
          {
            id: clientId,
            type: 'note',
            page: 3,
            note: 'synced from client',
            color: '#FF9800',
          },
        ],
        deletedIds: [],
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.synced.some((a: { id: string }) => a.id === clientId)).toBe(true)
    expect(body.serverAnnotations.length).toBeGreaterThan(0)
  })

  test('POST /auth/lti/launch returns access token and deep link', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/lti/launch`, {
      headers: { 'Content-Type': 'application/json' },
      data: { id_token: 'mock-lti-token', courseId: 'lms-course-501' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.accessToken).toBe('mock-token-learner')
    expect(body.deepLinkContentId).toBe('content-001')
  })

  test('GET /devices/me lists registered devices', async ({ request }) => {
    const res = await request.get(`${API_BASE}/devices/me`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.some((d: { id: string }) => d.id === 'device-001')).toBe(true)
  })

  test('POST /devices/register creates a new device', async ({ request }) => {
    const res = await request.post(`${API_BASE}/devices/register`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { name: 'Playwright Test Device', platform: 'web', deviceFingerprint: `fp-${Date.now()}` },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.id).toBeTruthy()
    expect(body.name).toBe('Playwright Test Device')
  })

  test('POST /devices/:id/heartbeat updates last seen', async ({ request }) => {
    const res = await request.post(`${API_BASE}/devices/device-001/heartbeat`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.lastSeenAt).toBeTruthy()
  })

  test('POST /contents/:id/offline-packages creates download package', async ({ request }) => {
    const res = await request.post(`${API_BASE}/contents/content-001/offline-packages`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { deviceId: 'device-001' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.downloadUrl).toContain('offline')
    expect(body.contentId).toBe('content-001')
    expect(body.pageCount).toBeGreaterThan(0)
  })

  test('POST /lms/deep-link generates launch url', async ({ request }) => {
    const res = await request.post(`${API_BASE}/lms/deep-link`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: { contentId: 'content-001', page: 5, courseId: 'lms-course-501' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.launchUrl).toContain('contentId=content-001')
    expect(body.launchUrl).toContain('page=5')
  })

  test('POST /lms/roster/sync completes for instructor', async ({ request }) => {
    const res = await request.post(`${API_BASE}/lms/roster/sync`, {
      headers: authHeaders(INSTRUCTOR_TOKEN),
      data: { courseId: 'lms-course-501' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.syncedAt).toBeTruthy()
    expect(body.message).toContain('名簿同期')
  })

  test('POST /lms/xapi/statements stores learning record', async ({ request }) => {
    const res = await request.post(`${API_BASE}/lms/xapi/statements`, {
      headers: authHeaders(LEARNER_TOKEN),
      data: {
        verb: { id: 'http://adlnet.gov/expapi/verbs/viewed' },
        object: { id: 'content-001' },
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.stored).toBe(true)
    expect(body.statement.actor.name).toBe('田中 太郎')
  })

  test('GET /lms/platforms returns org platforms for instructor', async ({ request }) => {
    const res = await request.get(`${API_BASE}/lms/platforms`, {
      headers: { Authorization: `Bearer ${INSTRUCTOR_TOKEN}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.some((p: { name: string }) => p.name === 'Canvas')).toBe(true)
  })

  test('learner and admin see different licensed content counts', async ({ request }) => {
    const learnerRes = await request.get(`${API_BASE}/contents`, {
      headers: { Authorization: `Bearer ${LEARNER_TOKEN}` },
    })
    const adminRes = await request.get(`${API_BASE}/contents`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    const learnerBody = await learnerRes.json()
    const adminBody = await adminRes.json()
    expect(learnerBody.data.length).toBeGreaterThan(adminBody.data.length)
    expect(adminBody.data.length).toBe(0)
  })
})
