const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3002'

/** token → { id, role, ... } の短寿命キャッシュ */
const introspectCache = new Map()
const CACHE_TTL_MS = 30_000

async function introspectToken(token) {
  const cached = introspectCache.get(token)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user
  }

  const res = await fetch(`${AUTH_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const user = await res.json()
  introspectCache.set(token, { user, expiresAt: Date.now() + CACHE_TTL_MS })
  return user
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authorization ヘッダーに Bearer トークンが必要です',
      hint: '開発用: Bearer mock-token-learner | mock-token-instructor | mock-token-admin',
    })
  }

  const token = header.slice(7)
  introspectToken(token)
    .then((me) => {
      if (!me?.id) {
        return res.status(401).json({
          error: 'invalid_token',
          message: '無効なトークンです',
          hint: '開発用: mock-token-learner, mock-token-instructor, mock-token-admin',
        })
      }

      const user = req.store.users.find((u) => u.id === me.id)
      if (!user) {
        return res.status(401).json({ error: 'user_not_found', message: 'ユーザーが見つかりません' })
      }

      req.user = user
      req.authToken = token
      next()
    })
    .catch((err) => {
      console.error('[auth] introspect failed', err.message)
      return res.status(503).json({
        error: 'auth_unavailable',
        message: '認証サービスに接続できません',
      })
    })
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }

  const token = header.slice(7)
  introspectToken(token)
    .then((me) => {
      if (me?.id) {
        req.user = req.store.users.find((u) => u.id === me.id)
      }
      next()
    })
    .catch(() => next())
}

module.exports = { authMiddleware, optionalAuth, introspectToken }
