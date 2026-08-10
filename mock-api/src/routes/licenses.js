const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { userLicenses, canAccessContent, paginate } = require('../store');

const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  const licenses = userLicenses(req.store, req.user.id).map((l) => {
    const content = req.store.contents.find((c) => c.id === l.contentId);
    return { ...l, content: content ? { id: content.id, title: content.title, coverUrl: content.coverUrl } : null };
  });
  res.json({ data: licenses });
});

router.post('/verify', authMiddleware, (req, res) => {
  const { contentId, action = 'view' } = req.body || {};
  const allowed = canAccessContent(req.store, req.user.id, contentId);
  const license = userLicenses(req.store, req.user.id).find((l) => l.contentId === contentId);
  const content = req.store.contents.find((c) => c.id === contentId);

  if (!allowed || !license || !content) {
    return res.json({
      allowed: false,
      canView: false,
      canDownloadOffline: false,
      reason: 'license_not_found',
    });
  }

  const now = new Date();
  const expired = new Date(license.expiresAt) < now;

  res.json({
    allowed: !expired,
    canView: !expired,
    canDownloadOffline: !expired && license.allowOffline && content.policy.allowOffline,
    expiresAt: license.expiresAt,
    offlineDays: content.policy.offlineDays,
    maxDevices: content.policy.maxDevices,
    reason: expired ? 'license_expired' : null,
  });
});

router.post('/offline-token', authMiddleware, (req, res) => {
  const { contentId, deviceId } = req.body || {};
  if (!canAccessContent(req.store, req.user.id, contentId)) {
    return res.status(403).json({ error: 'forbidden', message: 'ライセンスがありません' });
  }

  const content = req.store.contents.find((c) => c.id === contentId);
  const userDevices = req.store.devices.filter((d) => d.userId === req.user.id);
  const device = userDevices.find((d) => d.id === deviceId);

  if (!device) {
    return res.status(400).json({ error: 'device_not_registered', message: '端末が登録されていません' });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (content.policy.offlineDays || 30));

  res.json({
    offlineToken: `offline-${contentId}-${deviceId}-${Date.now()}`,
    contentId,
    deviceId,
    expiresAt: expiresAt.toISOString(),
    revalidateBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

router.get('/organizations/:orgId/licenses', authMiddleware, (req, res) => {
  if (req.user.orgId !== req.params.orgId || !['org_admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  const licenses = req.store.licenses
    .filter((l) => l.orgId === req.params.orgId)
    .map((l) => ({
      ...l,
      content: req.store.contents.find((c) => c.id === l.contentId),
      seatsUsed: l.assignedUserIds.length,
      seatsAvailable: l.seatCount - l.assignedUserIds.length,
    }));
  res.json({ data: licenses });
});

router.post('/organizations/:orgId/licenses/:licenseId/assign', authMiddleware, (req, res) => {
  if (req.user.role !== 'org_admin') {
    return res.status(403).json({ error: 'forbidden', message: 'ライセンス割当権限がありません' });
  }
  const license = req.store.licenses.find((l) => l.id === req.params.licenseId);
  if (!license) return res.status(404).json({ error: 'not_found', message: 'ライセンスが見つかりません' });

  const { userIds = [] } = req.body || {};
  for (const uid of userIds) {
    if (!license.assignedUserIds.includes(uid)) {
      if (license.assignedUserIds.length >= license.seatCount) {
        return res.status(409).json({ error: 'seats_exhausted', message: '席数上限に達しています' });
      }
      license.assignedUserIds.push(uid);
    }
  }
  res.json(license);
});

module.exports = router;
