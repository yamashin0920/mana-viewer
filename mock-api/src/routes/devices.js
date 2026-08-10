const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { uuidv4 } = require('../store');

const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  const devices = req.store.devices.filter((d) => d.userId === req.user.id);
  res.json({ data: devices });
});

router.post('/register', authMiddleware, (req, res) => {
  const { name, platform, deviceFingerprint } = req.body || {};
  const org = req.store.organizations.find((o) => o.id === req.user.orgId);
  const maxDevices = org?.settings?.maxOfflineDevices ?? 2;

  const userDevices = req.store.devices.filter((d) => d.userId === req.user.id);
  if (userDevices.length >= maxDevices) {
    return res.status(403).json({
      error: 'device_limit',
      message: `端末登録上限（${maxDevices}台）に達しています`,
      devices: userDevices,
    });
  }

  const now = new Date().toISOString();
  const device = {
    id: uuidv4(),
    userId: req.user.id,
    name: name || 'Unknown Device',
    platform: platform || 'web',
    deviceFingerprint: deviceFingerprint || null,
    registeredAt: now,
    lastSeenAt: now,
  };
  req.store.devices.push(device);
  res.status(201).json(device);
});

router.delete('/:deviceId', authMiddleware, (req, res) => {
  const idx = req.store.devices.findIndex(
    (d) => d.id === req.params.deviceId && d.userId === req.user.id
  );
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: '端末が見つかりません' });
  req.store.devices.splice(idx, 1);
  res.status(204).send();
});

router.post('/:deviceId/heartbeat', authMiddleware, (req, res) => {
  const device = req.store.devices.find(
    (d) => d.id === req.params.deviceId && d.userId === req.user.id
  );
  if (!device) return res.status(404).json({ error: 'not_found', message: '端末が見つかりません' });
  device.lastSeenAt = new Date().toISOString();
  res.json({ ok: true, lastSeenAt: device.lastSeenAt });
});

module.exports = router;
