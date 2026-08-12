const { authMiddleware } = require('./auth');

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!['org_admin', 'content_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: '管理者権限が必要です' });
    }
    next();
  });
}

function orgAdminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'org_admin') {
      return res.status(403).json({ error: 'forbidden', message: '組織管理者権限が必要です' });
    }
    next();
  });
}

module.exports = { adminMiddleware, orgAdminMiddleware };
