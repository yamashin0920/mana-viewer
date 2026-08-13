const express = require('express');
const { adminMiddleware, orgAdminMiddleware } = require('../middleware/admin');
const {
  saveSeed,
  uuidv4,
  userLicenses,
  userLicenseAssignments,
  isLicenseValid,
  generateCoverUrl,
} = require('../store');

const router = express.Router();

function sameOrg(req, orgId) {
  return req.user.orgId === orgId;
}

// --- Users ---

router.get('/users', adminMiddleware, (req, res) => {
  const users = req.store.users
    .filter((u) => u.orgId === req.user.orgId)
    .map((u) => ({
      ...u,
      licenses: userLicenseAssignments(req.store, u.id).map((l) => ({
        id: l.id,
        contentId: l.contentId,
        contentTitle: req.store.contents.find((c) => c.id === l.contentId)?.title,
        expiresAt: l.expiresAt,
        status: l.status,
        valid: isLicenseValid(l),
      })),
    }));
  res.json({ data: users });
});

router.put('/users/:userId/licenses', orgAdminMiddleware, (req, res) => {
  const user = req.store.users.find((u) => u.id === req.params.userId);
  if (!user || !sameOrg(req, user.orgId)) {
    return res.status(404).json({ error: 'not_found', message: 'ユーザーが見つかりません' });
  }

  const { licenseIds = [] } = req.body || {};
  const desired = new Set(licenseIds);
  const orgLicenses = req.store.licenses.filter((l) => l.orgId === req.user.orgId);

  for (const license of orgLicenses) {
    const shouldHave = desired.has(license.id);
    const has = license.assignedUserIds.includes(user.id);

    if (shouldHave && !has) {
      if (license.assignedUserIds.length >= license.seatCount) {
        const title = req.store.contents.find((c) => c.id === license.contentId)?.title ?? license.contentId;
        return res.status(409).json({
          error: 'seats_exhausted',
          message: `「${title}」の席数上限に達しています`,
        });
      }
      license.assignedUserIds.push(user.id);
    } else if (!shouldHave && has) {
      license.assignedUserIds = license.assignedUserIds.filter((id) => id !== user.id);
    }
  }

  saveSeed(req.store);
  res.json({
    data: userLicenseAssignments(req.store, user.id).map((l) => ({
      id: l.id,
      contentId: l.contentId,
      contentTitle: req.store.contents.find((c) => c.id === l.contentId)?.title,
      expiresAt: l.expiresAt,
      status: l.status,
      valid: isLicenseValid(l),
    })),
  });
});

router.post('/users', orgAdminMiddleware, (req, res) => {
  const { name, email, role = 'learner', externalId = null } = req.body || {};
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'validation_error', message: '名前とメールアドレスは必須です' });
  }
  const validRoles = ['learner', 'instructor', 'org_admin', 'content_admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'validation_error', message: '無効なロールです' });
  }

  const user = {
    id: `user-${uuidv4().slice(0, 8)}`,
    orgId: req.user.orgId,
    email: email.trim(),
    name: name.trim(),
    role,
    externalId,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };
  req.store.users.push(user);
  saveSeed(req.store);
  res.status(201).json(user);
});

router.put('/users/:userId', orgAdminMiddleware, (req, res) => {
  const user = req.store.users.find((u) => u.id === req.params.userId);
  if (!user || !sameOrg(req, user.orgId)) {
    return res.status(404).json({ error: 'not_found', message: 'ユーザーが見つかりません' });
  }

  const { name, email, role, externalId } = req.body || {};
  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.trim();
  if (role !== undefined) user.role = role;
  if (externalId !== undefined) user.externalId = externalId;

  saveSeed(req.store);
  res.json(user);
});

router.delete('/users/:userId', orgAdminMiddleware, (req, res) => {
  const idx = req.store.users.findIndex((u) => u.id === req.params.userId);
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: 'ユーザーが見つかりません' });
  const user = req.store.users[idx];
  if (!sameOrg(req, user.orgId)) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'cannot_delete_self', message: '自分自身は削除できません' });
  }

  req.store.users.splice(idx, 1);
  for (const license of req.store.licenses) {
    license.assignedUserIds = license.assignedUserIds.filter((id) => id !== user.id);
  }
  saveSeed(req.store);
  res.status(204).send();
});

// --- Licenses ---

router.get('/licenses', adminMiddleware, (req, res) => {
  const licenses = req.store.licenses
    .filter((l) => l.orgId === req.user.orgId)
    .map((l) => ({
      ...l,
      content: req.store.contents.find((c) => c.id === l.contentId),
      assignedUsers: l.assignedUserIds
        .map((uid) => req.store.users.find((u) => u.id === uid))
        .filter(Boolean),
      seatsUsed: l.assignedUserIds.length,
      seatsAvailable: l.seatCount - l.assignedUserIds.length,
    }));
  res.json({ data: licenses });
});

router.post('/licenses', orgAdminMiddleware, (req, res) => {
  const { contentId, seatCount = 1, startsAt, expiresAt, allowOffline = true, status = 'active', assignedUserIds = [] } =
    req.body || {};

  const content = req.store.contents.find((c) => c.id === contentId);
  if (!content || content.orgId !== req.user.orgId) {
    return res.status(400).json({ error: 'validation_error', message: 'コンテンツが見つかりません' });
  }
  if (!seatCount || seatCount < 1) {
    return res.status(400).json({ error: 'validation_error', message: '席数は1以上である必要があります' });
  }
  if (assignedUserIds.length > seatCount) {
    return res.status(400).json({ error: 'validation_error', message: '割当ユーザー数が席数を超えています' });
  }

  const license = {
    id: `license-${uuidv4().slice(0, 8)}`,
    orgId: req.user.orgId,
    contentId,
    seatCount,
    assignedUserIds: [...assignedUserIds],
    startsAt: startsAt || new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    allowOffline,
    status,
  };
  req.store.licenses.push(license);
  saveSeed(req.store);
  res.status(201).json(license);
});

router.put('/licenses/:licenseId', orgAdminMiddleware, (req, res) => {
  const license = req.store.licenses.find((l) => l.id === req.params.licenseId);
  if (!license || !sameOrg(req, license.orgId)) {
    return res.status(404).json({ error: 'not_found', message: 'ライセンスが見つかりません' });
  }

  const { seatCount, startsAt, expiresAt, allowOffline, status, assignedUserIds } = req.body || {};
  if (seatCount !== undefined) license.seatCount = seatCount;
  if (startsAt !== undefined) license.startsAt = startsAt;
  if (expiresAt !== undefined) license.expiresAt = expiresAt;
  if (allowOffline !== undefined) license.allowOffline = allowOffline;
  if (status !== undefined) license.status = status;
  if (assignedUserIds !== undefined) {
    if (assignedUserIds.length > license.seatCount) {
      return res.status(400).json({ error: 'validation_error', message: '割当ユーザー数が席数を超えています' });
    }
    license.assignedUserIds = [...assignedUserIds];
  }

  saveSeed(req.store);
  res.json(license);
});

router.delete('/licenses/:licenseId', orgAdminMiddleware, (req, res) => {
  const idx = req.store.licenses.findIndex((l) => l.id === req.params.licenseId);
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: 'ライセンスが見つかりません' });
  const license = req.store.licenses[idx];
  if (!sameOrg(req, license.orgId)) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }

  req.store.licenses.splice(idx, 1);
  saveSeed(req.store);
  res.status(204).send();
});

router.post('/licenses/:licenseId/assign', orgAdminMiddleware, (req, res) => {
  const license = req.store.licenses.find((l) => l.id === req.params.licenseId);
  if (!license || !sameOrg(req, license.orgId)) {
    return res.status(404).json({ error: 'not_found', message: 'ライセンスが見つかりません' });
  }

  const { userIds = [], action = 'add' } = req.body || {};

  if (action === 'remove') {
    license.assignedUserIds = license.assignedUserIds.filter((id) => !userIds.includes(id));
  } else {
    for (const uid of userIds) {
      if (!license.assignedUserIds.includes(uid)) {
        if (license.assignedUserIds.length >= license.seatCount) {
          return res.status(409).json({ error: 'seats_exhausted', message: '席数上限に達しています' });
        }
        license.assignedUserIds.push(uid);
      }
    }
  }

  saveSeed(req.store);
  res.json(license);
});

// --- Contents ---

router.get('/contents', adminMiddleware, (req, res) => {
  const contents = req.store.contents.filter((c) => c.orgId === req.user.orgId);
  res.json({ data: contents });
});

router.post('/contents', adminMiddleware, (req, res) => {
  if (req.user.role === 'content_admin' || req.user.role === 'org_admin') {
    // allowed
  } else {
    return res.status(403).json({ error: 'forbidden', message: 'コンテンツ作成権限がありません' });
  }

  const {
    title,
    author = '',
    isbn = '',
    description = '',
    coverUrl = '',
    pageCount = 1,
    category = '',
    tags = [],
    version = '1.0.0',
    status = 'draft',
    policy = {},
  } = req.body || {};

  if (!title?.trim()) {
    return res.status(400).json({ error: 'validation_error', message: 'タイトルは必須です' });
  }

  const content = {
    id: `content-${uuidv4().slice(0, 8)}`,
    orgId: req.user.orgId,
    title: title.trim(),
    author: author.trim(),
    isbn,
    description,
    coverUrl: coverUrl || generateCoverUrl(title),
    pageCount: Number(pageCount) || 1,
    fileSizeBytes: 0,
    category,
    tags,
    version,
    status,
    policy: {
      allowPrint: policy.allowPrint ?? false,
      allowOffline: policy.allowOffline ?? true,
      offlineDays: policy.offlineDays ?? 30,
      maxDevices: policy.maxDevices ?? 2,
      watermarkText: policy.watermarkText ?? '{userName} - {date}',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  req.store.contents.push(content);
  req.store.contentToc[content.id] = [];
  saveSeed(req.store);
  res.status(201).json(content);
});

router.put('/contents/:contentId', adminMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content || !sameOrg(req, content.orgId)) {
    return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  }

  const fields = [
    'title', 'author', 'isbn', 'description', 'coverUrl', 'pageCount',
    'category', 'tags', 'version', 'status',
  ];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) content[field] = req.body[field];
  }
  if (req.body?.title !== undefined && req.body.coverUrl === undefined) {
    content.coverUrl = generateCoverUrl(content.title);
  }
  if (req.body?.policy) {
    content.policy = { ...content.policy, ...req.body.policy };
  }
  content.updatedAt = new Date().toISOString();

  saveSeed(req.store);
  res.json(content);
});

router.delete('/contents/:contentId', orgAdminMiddleware, (req, res) => {
  const idx = req.store.contents.findIndex((c) => c.id === req.params.contentId);
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  const content = req.store.contents[idx];
  if (!sameOrg(req, content.orgId)) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }

  req.store.contents.splice(idx, 1);
  delete req.store.contentToc[content.id];
  req.store.licenses = req.store.licenses.filter((l) => l.contentId !== content.id);
  saveSeed(req.store);
  res.status(204).send();
});

module.exports = router;
