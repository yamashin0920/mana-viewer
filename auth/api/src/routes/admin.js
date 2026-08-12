const express = require('express');
const {
  loadCredentials,
  saveCredentials,
  loadUsers,
  getLoginId,
  generateToken,
  findUserById,
} = require('../store');
const { adminAuthMiddleware, orgAdminAuthMiddleware } = require('../middleware/admin');

const router = express.Router();

router.get('/credentials', adminAuthMiddleware, (_req, res) => {
  const users = loadUsers();
  const data = loadCredentials().map((entry) => {
    const linkedUser = findUserById(entry.linkedUserId);
    return {
      loginId: getLoginId(entry),
      token: entry.token,
      linkedUserId: entry.linkedUserId,
      linkedUser: linkedUser
        ? { id: linkedUser.id, name: linkedUser.name, email: linkedUser.email, role: linkedUser.role }
        : null,
    };
  });
  res.json({ data, users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })) });
});

router.post('/credentials', orgAdminAuthMiddleware, (req, res) => {
  const { loginId, password, linkedUserId } = req.body || {};
  if (!loginId?.trim() || !password?.trim() || !linkedUserId) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'ログインID、パスワード、紐付けユーザーは必須です',
    });
  }

  const user = findUserById(linkedUserId);
  if (!user) {
    return res.status(400).json({ error: 'validation_error', message: '紐付けユーザーが見つかりません' });
  }

  const credentials = loadCredentials();
  if (credentials.some((c) => getLoginId(c) === loginId.trim())) {
    return res.status(409).json({ error: 'duplicate', message: 'このログインIDは既に使用されています' });
  }
  if (credentials.some((c) => c.linkedUserId === linkedUserId)) {
    return res.status(409).json({ error: 'duplicate', message: 'このユーザーには既にログインアカウントが存在します' });
  }

  const entry = {
    loginId: loginId.trim(),
    userId: loginId.trim(),
    password: password.trim(),
    token: generateToken(),
    linkedUserId,
  };
  credentials.push(entry);
  saveCredentials(credentials);

  res.status(201).json({
    loginId: entry.loginId,
    token: entry.token,
    linkedUserId: entry.linkedUserId,
    linkedUser: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.put('/credentials/:loginId', orgAdminAuthMiddleware, (req, res) => {
  const credentials = loadCredentials();
  const idx = credentials.findIndex((c) => getLoginId(c) === req.params.loginId);
  if (idx === -1) {
    return res.status(404).json({ error: 'not_found', message: 'ログインアカウントが見つかりません' });
  }

  const entry = credentials[idx];
  const { password, linkedUserId, newLoginId } = req.body || {};

  if (newLoginId && newLoginId.trim() !== getLoginId(entry)) {
    if (credentials.some((c) => getLoginId(c) === newLoginId.trim())) {
      return res.status(409).json({ error: 'duplicate', message: 'このログインIDは既に使用されています' });
    }
    entry.loginId = newLoginId.trim();
    entry.userId = newLoginId.trim();
  }

  if (password !== undefined) entry.password = password.trim();

  if (linkedUserId !== undefined) {
    const user = findUserById(linkedUserId);
    if (!user) {
      return res.status(400).json({ error: 'validation_error', message: '紐付けユーザーが見つかりません' });
    }
    const duplicate = credentials.some((c, i) => i !== idx && c.linkedUserId === linkedUserId);
    if (duplicate) {
      return res.status(409).json({ error: 'duplicate', message: 'このユーザーには既にログインアカウントが存在します' });
    }
    entry.linkedUserId = linkedUserId;
  }

  credentials[idx] = entry;
  saveCredentials(credentials);

  const linkedUser = findUserById(entry.linkedUserId);
  res.json({
    loginId: getLoginId(entry),
    token: entry.token,
    linkedUserId: entry.linkedUserId,
    linkedUser: linkedUser
      ? { id: linkedUser.id, name: linkedUser.name, email: linkedUser.email, role: linkedUser.role }
      : null,
  });
});

router.delete('/credentials/:loginId', orgAdminAuthMiddleware, (req, res) => {
  const credentials = loadCredentials();
  const idx = credentials.findIndex((c) => getLoginId(c) === req.params.loginId);
  if (idx === -1) {
    return res.status(404).json({ error: 'not_found', message: 'ログインアカウントが見つかりません' });
  }

  if (getLoginId(credentials[idx]) === 'admin') {
    return res.status(400).json({ error: 'cannot_delete', message: 'デフォルト管理者アカウントは削除できません' });
  }

  credentials.splice(idx, 1);
  saveCredentials(credentials);
  res.status(204).send();
});

module.exports = router;
