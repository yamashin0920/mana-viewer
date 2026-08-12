const { userIdForToken, findUserById, isAdminUser } = require('../store');

function adminAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authorization ヘッダーに Bearer トークンが必要です',
    });
  }

  const token = header.slice(7);
  const userId = userIdForToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'invalid_token', message: '無効なトークンです' });
  }

  const user = findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'user_not_found', message: 'ユーザーが見つかりません' });
  }

  if (!isAdminUser(user)) {
    return res.status(403).json({ error: 'forbidden', message: '管理者権限が必要です' });
  }

  req.user = user;
  req.token = token;
  next();
}

function orgAdminAuthMiddleware(req, res, next) {
  adminAuthMiddleware(req, res, () => {
    if (req.user.role !== 'org_admin') {
      return res.status(403).json({ error: 'forbidden', message: '組織管理者権限が必要です' });
    }
    next();
  });
}

module.exports = { adminAuthMiddleware, orgAdminAuthMiddleware };
