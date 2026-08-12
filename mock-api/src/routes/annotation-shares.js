const express = require('express');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { canAccessContent, uuidv4 } = require('../store');

const router = express.Router();

const DEFAULT_EXPIRES_DAYS = 7;

function ensureSharesStore(store) {
  if (!store.annotationShares) {
    store.annotationShares = [];
  }
}

router.post('/:contentId/annotations/share', authMiddleware, (req, res) => {
  ensureSharesStore(req.store);

  const contentId = req.params.contentId;
  if (!canAccessContent(req.store, req.user.id, contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const content = req.store.contents.find((c) => c.id === contentId);
  if (!content) {
    return res.status(404).json({ error: 'not_found', message: '教材が見つかりません' });
  }

  const { annotationIds, expiresInDays = DEFAULT_EXPIRES_DAYS } = req.body || {};
  let userAnnotations = req.store.annotations.filter(
    (a) => a.contentId === contentId && a.userId === req.user.id
  );

  if (Array.isArray(annotationIds) && annotationIds.length > 0) {
    userAnnotations = userAnnotations.filter((a) => annotationIds.includes(a.id));
  }

  if (userAnnotations.length === 0) {
    return res.status(400).json({
      error: 'no_annotations',
      message: '共有する注釈がありません',
    });
  }

  const days = Math.min(30, Math.max(1, Number(expiresInDays) || DEFAULT_EXPIRES_DAYS));
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const shareId = uuidv4();

  const share = {
    id: shareId,
    contentId,
    userId: req.user.id,
    annotationIds: userAnnotations.map((a) => a.id),
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  req.store.annotationShares.push(share);

  res.status(201).json({
    shareId,
    shareUrl: `/viewer/${contentId}?share=${shareId}`,
    expiresAt,
    annotationCount: userAnnotations.length,
    contentTitle: content.title,
  });
});

router.get('/shared/:shareId', optionalAuth, (req, res) => {
  ensureSharesStore(req.store);

  const share = req.store.annotationShares.find((s) => s.id === req.params.shareId);
  if (!share) {
    return res.status(404).json({ error: 'not_found', message: '共有リンクが見つかりません' });
  }

  if (new Date(share.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'expired', message: '共有リンクの有効期限が切れています' });
  }

  const content = req.store.contents.find((c) => c.id === share.contentId);
  const owner = req.store.users.find((u) => u.id === share.userId);
  const annotations = req.store.annotations.filter((a) => share.annotationIds.includes(a.id));

  if (req.user && !canAccessContent(req.store, req.user.id, share.contentId)) {
    return res.status(403).json({ error: 'forbidden', message: 'この教材を閲覧するライセンスがありません' });
  }

  res.json({
    shareId: share.id,
    contentId: share.contentId,
    contentTitle: content?.title ?? '教材',
    sharedBy: owner ? { id: owner.id, name: owner.name } : null,
    sharedAt: share.createdAt,
    expiresAt: share.expiresAt,
    annotations,
  });
});

module.exports = router;
