const express = require('express');
const cors = require('cors');
const { createStore } = require('./store');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const licenseRoutes = require('./routes/licenses');
const contentRoutes = require('./routes/contents');
const bookshelfRoutes = require('./routes/bookshelves');
const annotationRoutes = require('./routes/annotations');
const annotationShareRoutes = require('./routes/annotation-shares');
const annotationByIdRoutes = require('./routes/annotation-by-id');
const deviceRoutes = require('./routes/devices');
const lmsRoutes = require('./routes/lms');
const adminRoutes = require('./routes/admin');

const PORT = process.env.PORT || 3001;

const app = express();
const store = createStore();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  req.store = store;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mana-viewer-mock-api', version: '0.1.0' });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'mana-viewer Mock API',
    version: '0.1.0',
    docs: '/health',
    auth: {
      hint: 'Authorization: Bearer mock-token-learner',
      note: 'ログインは auth サービス (port 5180 / 3002) を使用',
    },
    endpoints: {
      auth: ['(moved) → auth-api: POST /auth/login'],
      users: ['GET /users/me', 'GET /organizations/:orgId/members'],
      licenses: ['GET /licenses/me', 'POST /licenses/verify', 'POST /licenses/offline-token'],
      contents: [
        'GET /contents',
        'GET /contents/:id',
        'GET /contents/:id/policy',
        'POST /contents/:id/view-sessions',
        'GET /contents/:id/chunks/:page',
        'POST /contents/:id/offline-packages',
        'PUT /contents/:id/progress',
      ],
      bookshelves: ['GET /bookshelves', 'GET /bookshelves/:id/items'],
      annotations: [
        'GET /contents/:id/annotations',
        'POST /contents/:id/annotations',
        'POST /contents/:id/annotations/sync',
        'POST /contents/:id/annotations/share',
        'GET /annotations/shared/:shareId',
      ],
      devices: ['GET /devices/me', 'POST /devices/register'],
      lms: ['POST /lms/deep-link', 'POST /lms/roster/sync', 'POST /lms/xapi/statements'],
    },
  });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/licenses', licenseRoutes);
app.use('/contents', contentRoutes);
app.use('/bookshelves', bookshelfRoutes);
app.use('/contents', annotationRoutes);
app.use('/contents', annotationShareRoutes);
app.use('/annotations', annotationShareRoutes);
app.use('/annotations', annotationByIdRoutes);
app.use('/devices', deviceRoutes);
app.use('/lms', lmsRoutes);
app.use('/admin', adminRoutes);

app.get('/mock/offline/:filename', (req, res) => {
  res.set('Content-Type', 'application/octet-stream');
  res.set('X-Mock-Offline-Package', 'true');
  res.send(
    Buffer.from(
      JSON.stringify({
        mock: true,
        filename: req.params.filename,
        encrypted: true,
        note: 'これはモックのオフラインパッケージです。実際の PDF バイナリではありません。',
      })
    )
  );
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'エンドポイントが見つかりません' });
});

app.listen(PORT, () => {
  console.log(`mana-viewer Mock API running at http://localhost:${PORT}`);
  console.log('開発用トークン: mock-token-learner | mock-token-instructor | mock-token-admin');
});

module.exports = app;
