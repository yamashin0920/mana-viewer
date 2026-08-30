const { authMiddleware } = require('./auth');
const { isAdminRole, isOrgAdminRole } = require('@mana/contracts/node');

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!isAdminRole(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: '管理者権限が必要です' });
    }
    next();
  });
}

function orgAdminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!isOrgAdminRole(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: '組織管理者権限が必要です' });
    }
    next();
  });
}

/** コンテンツ作成・更新は content_admin も可（削除は org_admin のみ） */
function contentWriteMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!canPermissionRole(req.user.role, 'contents:write')) {
      return res.status(403).json({ error: 'forbidden', message: 'コンテンツ作成権限がありません' });
    }
    next();
  });
}

module.exports = { adminMiddleware, orgAdminMiddleware, contentWriteMiddleware };
