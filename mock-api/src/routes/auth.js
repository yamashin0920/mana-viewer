const express = require('express');

const router = express.Router();

/** @deprecated 認証は auth-api (port 3002) に移行しました */
router.post('/login', (_req, res) => {
  res.status(410).json({
    error: 'moved',
    message: '認証 API は auth-api (http://localhost:3002) に移行しました',
    authService: 'http://localhost:3002/auth/login',
  });
});

router.post('/lti/launch', (req, res) => {
  const { id_token: idToken, courseId } = req.body || {};
  res.json({
    accessToken: 'mock-token-learner',
    user: req.store.users.find((u) => u.id === 'user-001'),
    courseId: courseId || 'lms-course-501',
    deepLinkContentId: idToken ? 'content-001' : null,
    message: 'モック: LTI 1.3 起動成功',
  });
});

router.get('/tokens', (_req, res) => {
  res.status(410).json({
    error: 'moved',
    message: '開発用トークン一覧は auth-api GET /auth/tokens を参照してください',
  });
});

module.exports = router;
