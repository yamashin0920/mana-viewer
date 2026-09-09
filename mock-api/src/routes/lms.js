const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { uuidv4, canAccessContent } = require('../store');

const router = express.Router();

const VIEWER_URL = process.env.VIEWER_URL || process.env.VITE_VIEWER_URL || 'http://localhost:5173';

function ensureXapiStore(store) {
  if (!Array.isArray(store.xapiStatements)) {
    store.xapiStatements = [];
  }
}

function orgCourses(store, orgId) {
  return store.groups.filter((g) => g.orgId === orgId);
}

function courseMaterials(store, user) {
  return store.bookshelfItems
    .filter((i) => i.shelfId === 'shelf-distributed')
    .map((ref) => store.contents.find((c) => c.id === ref.contentId))
    .filter(Boolean)
    .filter((c) => c.orgId === user.orgId && c.status === 'published');
}

function canManageLms(user) {
  return ['org_admin', 'instructor', 'content_admin'].includes(user.role);
}

function serializeCourse(store, group, user) {
  const materials = courseMaterials(store, user);
  return {
    id: group.id,
    name: group.name,
    externalCourseId: group.externalCourseId,
    memberIds: group.memberIds,
    memberCount: group.memberIds.length,
    materialCount: materials.length,
    members: group.memberIds
      .map((id) => store.users.find((u) => u.id === id))
      .filter(Boolean)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
    materials: materials.map((c) => ({
      id: c.id,
      title: c.title,
      author: c.author,
      pageCount: c.pageCount,
      coverUrl: c.coverUrl,
      category: c.category,
    })),
  };
}

router.get('/platforms', authMiddleware, (req, res) => {
  if (!canManageLms(req.user)) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  const platforms = req.store.lmsPlatforms.filter((p) => p.orgId === req.user.orgId);
  res.json({ data: platforms });
});

router.post('/platforms', authMiddleware, (req, res) => {
  if (req.user.role !== 'org_admin') {
    return res.status(403).json({ error: 'forbidden', message: 'LMS 設定権限がありません' });
  }
  const { name, clientId, deploymentId, issuer, authUrl, tokenUrl, jwksUrl } = req.body || {};
  const platform = {
    id: uuidv4(),
    orgId: req.user.orgId,
    name,
    clientId,
    deploymentId,
    issuer,
    authUrl,
    tokenUrl,
    jwksUrl,
    lastSyncAt: null,
  };
  req.store.lmsPlatforms.push(platform);
  res.status(201).json(platform);
});

router.get('/courses', authMiddleware, (req, res) => {
  let groups = orgCourses(req.store, req.user.orgId);
  if (req.user.role === 'learner') {
    groups = groups.filter((g) => g.memberIds.includes(req.user.id));
  }
  res.json({
    data: groups.map((g) => serializeCourse(req.store, g, req.user)),
  });
});

router.get('/courses/:externalCourseId', authMiddleware, (req, res) => {
  const group = req.store.groups.find(
    (g) =>
      g.orgId === req.user.orgId &&
      (g.externalCourseId === req.params.externalCourseId || g.id === req.params.externalCourseId)
  );
  if (!group) {
    return res.status(404).json({ error: 'not_found', message: 'コースが見つかりません' });
  }
  if (req.user.role === 'learner' && !group.memberIds.includes(req.user.id)) {
    return res.status(403).json({ error: 'forbidden', message: 'このコースのメンバーではありません' });
  }
  res.json(serializeCourse(req.store, group, req.user));
});

router.post('/launch', authMiddleware, (req, res) => {
  const { contentId, page = 1, courseId } = req.body || {};
  const content = req.store.contents.find((c) => c.id === contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const params = new URLSearchParams({
    page: String(pageNum),
    lmsLaunch: '1',
  });
  if (courseId) params.set('courseId', String(courseId));

  res.json({
    launchUrl: `${VIEWER_URL}/viewer/${contentId}?${params.toString()}`,
    content: { id: content.id, title: content.title, pageCount: content.pageCount },
    courseId: courseId || null,
    page: pageNum,
    message: 'LTI / Deep Link 起動 URL を発行しました',
  });
});

router.post('/deep-link', authMiddleware, (req, res) => {
  const { contentId, page, courseId } = req.body || {};
  const content = req.store.contents.find((c) => c.id === contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const params = new URLSearchParams({
    page: String(pageNum),
    lmsLaunch: '1',
  });
  if (courseId) params.set('courseId', String(courseId));

  res.json({
    launchUrl: `${VIEWER_URL}/viewer/${contentId}?${params.toString()}`,
    content: { id: content.id, title: content.title },
    courseId: courseId || null,
    page: pageNum,
    message: 'Deep Link 生成完了',
  });
});

router.post('/roster/sync', authMiddleware, (req, res) => {
  if (!canManageLms(req.user)) {
    return res.status(403).json({ error: 'forbidden', message: '名簿同期権限がありません' });
  }

  const { courseId } = req.body || {};
  const group = req.store.groups.find((g) => g.externalCourseId === courseId || g.id === courseId);
  const platform = req.store.lmsPlatforms.find((p) => p.orgId === req.user.orgId);
  if (platform) {
    platform.lastSyncAt = new Date().toISOString();
  }

  res.json({
    courseId: courseId || group?.externalCourseId || null,
    syncedAt: new Date().toISOString(),
    membersAdded: group ? group.memberIds.length : 0,
    licensesAssigned: group ? group.memberIds.length : 0,
    message: '名簿同期完了',
  });
});

router.get('/courses/:externalCourseId/materials', authMiddleware, (req, res) => {
  const group = req.store.groups.find(
    (g) => g.externalCourseId === req.params.externalCourseId || g.id === req.params.externalCourseId
  );
  if (!group) {
    return res.json({ courseId: req.params.externalCourseId, data: [] });
  }

  const materials = courseMaterials(req.store, req.user);
  res.json({ courseId: req.params.externalCourseId, groupId: group.id, data: materials });
});

router.get('/xapi/statements', authMiddleware, (req, res) => {
  ensureXapiStore(req.store);
  let items = req.store.xapiStatements.filter((s) => s.orgId === req.user.orgId);
  if (req.user.role === 'learner') {
    items = items.filter((s) => s.userId === req.user.id);
  }
  items = [...items].sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  res.json({ data: items });
});

router.post('/xapi/statements', authMiddleware, (req, res) => {
  ensureXapiStore(req.store);
  const statement = req.body || {};
  const record = {
    id: uuidv4(),
    orgId: req.user.orgId,
    userId: req.user.id,
    stored: true,
    receivedAt: new Date().toISOString(),
    statement: {
      actor: { name: req.user.name, mbox: `mailto:${req.user.email}` },
      ...statement,
    },
  };
  req.store.xapiStatements.push(record);
  res.status(201).json({
    id: record.id,
    stored: true,
    receivedAt: record.receivedAt,
    statement: record.statement,
    message: 'xAPI ステートメント受信',
  });
});

module.exports = router;
