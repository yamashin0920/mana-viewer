const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  const org = req.store.organizations.find((o) => o.id === req.user.orgId);
  res.json({ ...req.user, organization: org ? { id: org.id, name: org.name, branding: org.settings.branding } : null });
});

router.get('/organizations/:orgId', authMiddleware, (req, res) => {
  const org = req.store.organizations.find((o) => o.id === req.params.orgId);
  if (!org) return res.status(404).json({ error: 'not_found', message: '組織が見つかりません' });
  if (req.user.orgId !== org.id && req.user.role !== 'org_admin') {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  res.json(org);
});

router.get('/organizations/:orgId/members', authMiddleware, (req, res) => {
  if (req.user.orgId !== req.params.orgId) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  const members = req.store.users.filter((u) => u.orgId === req.params.orgId);
  res.json({ data: members });
});

router.get('/organizations/:orgId/groups', authMiddleware, (req, res) => {
  if (req.user.orgId !== req.params.orgId) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  const groups = req.store.groups.filter((g) => g.orgId === req.params.orgId);
  res.json({ data: groups });
});

router.post('/organizations/:orgId/groups', authMiddleware, (req, res) => {
  if (req.user.role !== 'org_admin' && req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'forbidden', message: 'グループ作成権限がありません' });
  }
  const { name, externalCourseId, memberIds = [] } = req.body || {};
  const group = {
    id: `group-${Date.now()}`,
    orgId: req.params.orgId,
    name,
    externalCourseId: externalCourseId || null,
    memberIds,
    createdAt: new Date().toISOString(),
  };
  req.store.groups.push(group);
  res.status(201).json(group);
});

module.exports = router;
