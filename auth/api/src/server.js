const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 3002;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'manabu-kun-auth-api', version: '0.1.0' });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'manabu-kun Auth API',
    version: '0.1.0',
    endpoints: ['POST /auth/login', 'POST /auth/refresh', 'GET /auth/tokens'],
  });
});

app.use('/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'エンドポイントが見つかりません' });
});

app.listen(PORT, () => {
  console.log(`manabu-kun Auth API running at http://localhost:${PORT}`);
});

module.exports = app;
