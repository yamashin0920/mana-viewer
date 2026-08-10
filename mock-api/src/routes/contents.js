const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { canAccessContent, paginate, watermarkText, generateMockChunk, uuidv4 } = require('../store');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const { q, category, page, limit } = req.query;
  let items = req.store.contents.filter((c) => {
    if (c.orgId !== req.user.orgId) return false;
    if (c.status !== 'published') return false;
    if (!canAccessContent(req.store, req.user.id, c.id)) return false;
    if (category && c.category !== category) return false;
    if (q) {
      const term = q.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.author.toLowerCase().includes(term) ||
        c.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  items = items.map((c) => {
    const prog = req.store.progress.find(
      (p) => p.userId === req.user.id && p.contentId === c.id
    );
    return { ...c, progress: prog || null };
  });

  res.json(paginate(items, page, limit));
});

router.get('/:contentId', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const prog = req.store.progress.find(
    (p) => p.userId === req.user.id && p.contentId === content.id
  );
  const toc = req.store.contentToc[content.id] || [];

  res.json({ ...content, progress: prog || null, toc });
});

router.get('/:contentId/policy', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  res.json({
    contentId: content.id,
    ...content.policy,
    watermark: watermarkText(content.policy, req.user),
    drm: {
      encrypted: true,
      algorithm: 'AES-256-GCM',
      streamingOnly: true,
      allowScreenshot: false,
      allowCopy: false,
    },
  });
});

router.get('/:contentId/toc', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }
  res.json({ contentId: content.id, toc: req.store.contentToc[content.id] || [] });
});

router.post('/:contentId/view-sessions', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const session = {
    id: uuidv4(),
    contentId: content.id,
    userId: req.user.id,
    sessionToken: `session-${content.id}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    watermark: watermarkText(content.policy, req.user),
    pageCount: content.pageCount,
  };
  req.store.viewSessions.push(session);

  res.status(201).json(session);
});

router.get('/:contentId/chunks/:page', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const sessionToken = req.headers['x-session-token'];
  if (!sessionToken) {
    return res.status(401).json({
      error: 'session_required',
      message: 'X-Session-Token ヘッダーが必要です。view-sessions で取得してください',
    });
  }

  const page = Number(req.params.page);
  if (page < 1 || page > content.pageCount) {
    return res.status(400).json({ error: 'invalid_page', message: `ページは 1〜${content.pageCount} の範囲です` });
  }

  const chunk = generateMockChunk(content.id, page);
  res.set({
    'Content-Type': 'application/octet-stream',
    'X-Content-Id': content.id,
    'X-Page': String(page),
    'X-Encrypted': 'true',
    'X-Mock': 'true',
  });
  res.send(chunk);
});

router.post('/:contentId/offline-packages', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }
  if (!content.policy.allowOffline) {
    return res.status(403).json({ error: 'offline_not_allowed', message: 'このコンテンツはオフライン不可です' });
  }

  const { deviceId } = req.body || {};
  const device = req.store.devices.find((d) => d.id === deviceId && d.userId === req.user.id);
  if (!device) {
    return res.status(400).json({ error: 'device_not_registered', message: '端末が登録されていません' });
  }

  const userDeviceCount = req.store.devices.filter((d) => d.userId === req.user.id).length;
  if (userDeviceCount > content.policy.maxDevices) {
    return res.status(403).json({ error: 'device_limit', message: '端末数上限を超えています' });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + content.policy.offlineDays);

  const pkg = {
    id: uuidv4(),
    contentId: content.id,
    userId: req.user.id,
    deviceId,
    downloadUrl: `http://localhost:${process.env.PORT || 3001}/mock/offline/${content.id}.pkg`,
    packageSizeBytes: content.fileSizeBytes,
    encryptionKeyHint: `device-key-${deviceId}`,
    expiresAt: expiresAt.toISOString(),
    pageCount: content.pageCount,
    createdAt: new Date().toISOString(),
  };
  req.store.offlinePackages.push(pkg);

  res.status(201).json(pkg);
});

router.put('/:contentId/progress', authMiddleware, (req, res) => {
  const content = req.store.contents.find((c) => c.id === req.params.contentId);
  if (!content) return res.status(404).json({ error: 'not_found', message: 'コンテンツが見つかりません' });
  if (!canAccessContent(req.store, req.user.id, content.id)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const { currentPage, scrollOffset, zoom, viewMode, progressPercent } = req.body || {};
  let prog = req.store.progress.find(
    (p) => p.userId === req.user.id && p.contentId === content.id
  );

  const now = new Date().toISOString();
  if (prog) {
    Object.assign(prog, {
      currentPage: currentPage ?? prog.currentPage,
      scrollOffset: scrollOffset ?? prog.scrollOffset,
      zoom: zoom ?? prog.zoom,
      viewMode: viewMode ?? prog.viewMode,
      progressPercent: progressPercent ?? prog.progressPercent,
      lastReadAt: now,
    });
  } else {
    prog = {
      userId: req.user.id,
      contentId: content.id,
      currentPage: currentPage ?? 1,
      progressPercent: progressPercent ?? 0,
      scrollOffset: scrollOffset ?? 0,
      zoom: zoom ?? 1.0,
      viewMode: viewMode ?? 'single',
      lastReadAt: now,
      totalReadSeconds: 0,
    };
    req.store.progress.push(prog);
  }

  res.json(prog);
});

router.get('/:contentId/progress', authMiddleware, (req, res) => {
  const prog = req.store.progress.find(
    (p) => p.userId === req.user.id && p.contentId === req.params.contentId
  );
  if (!prog) {
    return res.json({
      userId: req.user.id,
      contentId: req.params.contentId,
      currentPage: 1,
      progressPercent: 0,
      scrollOffset: 0,
      zoom: 1.0,
      viewMode: 'single',
      lastReadAt: null,
      totalReadSeconds: 0,
    });
  }
  res.json(prog);
});

router.post('/:contentId/progress/sync', authMiddleware, (req, res) => {
  const { items = [] } = req.body || {};
  const synced = [];

  for (const item of items) {
    let prog = req.store.progress.find(
      (p) => p.userId === req.user.id && p.contentId === req.params.contentId
    );
    if (prog) {
      Object.assign(prog, item, { lastReadAt: item.lastReadAt || new Date().toISOString() });
    } else {
      prog = { userId: req.user.id, contentId: req.params.contentId, ...item };
      req.store.progress.push(prog);
    }
    synced.push(prog);
  }

  res.json({ synced, serverTime: new Date().toISOString() });
});

module.exports = router;
