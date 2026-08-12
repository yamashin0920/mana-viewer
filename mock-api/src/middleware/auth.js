const { loadTokenMap } = require('../store');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authorization ヘッダーに Bearer トークンが必要です',
      hint: '開発用: Bearer mock-token-learner | mock-token-instructor | mock-token-admin',
    });
  }

  const token = header.slice(7);
  const userId = loadTokenMap()[token];
  if (!userId) {
    return res.status(401).json({
      error: 'invalid_token',
      message: '無効なトークンです',
      hint: '開発用: mock-token-learner, mock-token-instructor, mock-token-admin',
    });
  }

  const user = req.store.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'user_not_found', message: 'ユーザーが見つかりません' });
  }

  req.user = user;
  next();
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7);
    const userId = loadTokenMap()[token];
    if (userId) {
      req.user = req.store.users.find((u) => u.id === userId);
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
