const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { uuidv4 } = require('../store');

const router = express.Router();

router.get('/platforms', authMiddleware, (req, res) => {
  if (!['org_admin', 'instructor'].includes(req.user.role)) {
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

router.post('/deep-link', authMiddleware, (req, res) => {
  const { contentId, page, courseId } = req.body || {};
  const content = req.store.contents.find((c) => c.id === contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });

  res.json({
    launchUrl: `http://localhost:${process.env.PORT || 3001}/viewer?contentId=${contentId}&page=${page || 1}`,
    content: { id: content.id, title: content.title },
    courseId: courseId || null,
    message: 'モック: Deep Link 生成完了',
  });
});

router.post('/roster/sync', authMiddleware, (req, res) => {
  if (!['org_admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'forbidden', message: '名簿同期権限がありません' });
  }

  const { courseId } = req.body || {};
  const group = req.store.groups.find((g) => g.externalCourseId === courseId);

  res.json({
    courseId,
    syncedAt: new Date().toISOString(),
    membersAdded: group ? group.memberIds.length : 0,
    licensesAssigned: 3,
    message: 'モック: 名簿同期完了',
  });
});

router.get('/courses/:externalCourseId/materials', authMiddleware, (req, res) => {
  const group = req.store.groups.find(
    (g) => g.externalCourseId === req.params.externalCourseId
  );
  if (!group) {
    return res.json({ courseId: req.params.externalCourseId, data: [] });
  }

  const materials = req.store.bookshelfItems
    .filter((i) => i.shelfId === 'shelf-distributed')
    .map((ref) => req.store.contents.find((c) => c.id === ref.contentId))
    .filter(Boolean);

  res.json({ courseId: req.params.externalCourseId, groupId: group.id, data: materials });
});

router.post('/xapi/statements', authMiddleware, (req, res) => {
  const statement = req.body || {};
  res.status(201).json({
    id: uuidv4(),
    stored: true,
    receivedAt: new Date().toISOString(),
    statement: {
      actor: { name: req.user.name, mbox: `mailto:${req.user.email}` },
      ...statement,
    },
    message: 'モック: xAPI ステートメント受信',
  });
});

module.exports = router;
