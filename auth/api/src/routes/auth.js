const express = require('express');
const { loadUsers, findCredential, userIdForToken } = require('../store');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, userId, password } = req.body || {};
  const loginId = String(email || userId || '').trim();
  const pw = String(password ?? '').trim();

  if (!loginId || !pw) {
    return res.status(400).json({
      error: 'invalid_credentials',
      message: 'ID とパスワードを入力してください',
    });
  }

  const credential = findCredential(loginId, pw);
  if (!credential) {
    return res.status(401).json({
      error: 'invalid_credentials',
      message: 'ID またはパスワードが正しくありません',
    });
  }

  const mappedUserId = userIdForToken(credential.token);
  const users = loadUsers();
  const user = users.find((u) => u.id === mappedUserId);
  if (!user) {
    return res.status(500).json({
      error: 'user_not_found',
      message: 'アカウント情報が見つかりません',
    });
  }

  const accessToken = credential.token;

  res.json({
    accessToken,
    refreshToken: `refresh-${accessToken}`,
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    },
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken?.startsWith('refresh-')) {
    return res.status(401).json({ error: 'invalid_refresh_token', message: '無効なリフレッシュトークンです' });
  }
  const accessToken = refreshToken.replace('refresh-', '');
  res.json({ accessToken, expiresIn: 3600, tokenType: 'Bearer' });
});

router.get('/tokens', (_req, res) => {
  res.json({
    message: '開発用モックトークン一覧',
    tokens: [
      { token: 'mock-token-learner', role: 'learner', email: 'tanaka@tokyo-gakuen.example.jp' },
      { token: 'mock-token-instructor', role: 'instructor', email: 'suzuki@tokyo-gakuen.example.jp' },
      { token: 'mock-token-admin', role: 'org_admin', email: 'admin@tokyo-gakuen.example.jp' },
    ],
  });
});

module.exports = router;
