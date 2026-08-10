# manabu-kun Mock API

PDF ビューア開発用のモック API サーバーです。B2B・オフライン・注釈・DRM・LMS 連携を想定したエンドポイントを提供します。

## 起動

```bash
cd mock-api
npm install
npm start
```

デフォルト: `http://localhost:3001`

開発時（ファイル変更で自動再起動）:

```bash
npm run dev
```

## 認証

すべての保護された API には `Authorization` ヘッダーが必要です。

```
Authorization: Bearer mock-token-learner
```

### 開発用トークン

| トークン | ロール | ユーザー |
|----------|--------|----------|
| `mock-token-learner` | learner | 田中 太郎 |
| `mock-token-instructor` | instructor | 鈴木 花子 |
| `mock-token-admin` | org_admin | 管理者 |

トークン一覧: `GET /auth/tokens`

## ビューア開発の典型フロー

### 1. 本棚・コンテンツ一覧

```bash
curl -H "Authorization: Bearer mock-token-learner" \
  http://localhost:3001/bookshelves

curl -H "Authorization: Bearer mock-token-learner" \
  http://localhost:3001/contents
```

### 2. 閲覧セッション開始 → ページ取得

```bash
# セッション取得
curl -X POST -H "Authorization: Bearer mock-token-learner" \
  http://localhost:3001/contents/content-001/view-sessions

# 暗号化チャンク取得（X-Session-Token 必須）
curl -H "Authorization: Bearer mock-token-learner" \
  -H "X-Session-Token: session-content-001-..." \
  http://localhost:3001/contents/content-001/chunks/1 \
  --output page1.bin
```

### 3. 進捗・注釈

```bash
# 進捗保存
curl -X PUT -H "Authorization: Bearer mock-token-learner" \
  -H "Content-Type: application/json" \
  -d '{"currentPage":42,"progressPercent":16.9}' \
  http://localhost:3001/contents/content-001/progress

# 注釈一覧
curl -H "Authorization: Bearer mock-token-learner" \
  http://localhost:3001/contents/content-001/annotations

# ハイライト追加
curl -X POST -H "Authorization: Bearer mock-token-learner" \
  -H "Content-Type: application/json" \
  -d '{"type":"highlight","page":42,"color":"#FFEB3B","selectedText":"2次関数","rects":[{"x":72,"y":400,"width":300,"height":18}]}' \
  http://localhost:3001/contents/content-001/annotations
```

### 4. オフライン

```bash
# 端末登録
curl -X POST -H "Authorization: Bearer mock-token-learner" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPad Pro","platform":"ios"}' \
  http://localhost:3001/devices/register

# オフラインパッケージ取得
curl -X POST -H "Authorization: Bearer mock-token-learner" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"<上で返った device id>"}' \
  http://localhost:3001/contents/content-001/offline-packages
```

## エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/health` | ヘルスチェック |
| POST | `/auth/login` | ログイン（メールでモックトークン返却） |
| POST | `/auth/lti/launch` | LTI 起動 |
| GET | `/auth/tokens` | 開発用トークン一覧 |
| GET | `/users/me` | 自分のプロフィール |
| GET | `/licenses/me` | 自分のライセンス |
| POST | `/licenses/verify` | ライセンス検証 |
| POST | `/licenses/offline-token` | オフラインライセンストークン |
| GET | `/contents` | コンテンツ一覧 |
| GET | `/contents/:id` | コンテンツ詳細 + TOC |
| GET | `/contents/:id/policy` | DRM ポリシー |
| POST | `/contents/:id/view-sessions` | 閲覧セッション |
| GET | `/contents/:id/chunks/:page` | 暗号化ページチャンク |
| POST | `/contents/:id/offline-packages` | オフラインパッケージ |
| GET/PUT | `/contents/:id/progress` | 読書進捗 |
| POST | `/contents/:id/progress/sync` | 進捗一括同期 |
| GET | `/bookshelves` | 本棚一覧 |
| GET/POST | `/contents/:id/annotations` | 注釈 CRUD |
| POST | `/contents/:id/annotations/sync` | 注釈一括同期 |
| GET/POST | `/devices/*` | 端末管理 |
| POST | `/lms/deep-link` | LMS Deep Link |
| POST | `/lms/roster/sync` | 名簿同期 |
| POST | `/lms/xapi/statements` | 学習記録 |

## モックデータ

`data/seed.json` にサンプルデータがあります。

- 組織: 東京学習高等学校
- コンテンツ: 数学I / 英語I / 物理実験（3 冊）
- 学習者 `user-001` は数学I・英語I・物理にライセンスあり

## 注意

- データはインメモリ。サーバー再起動で変更はリセットされます（seed から再読込）
- PDF チャンク・オフラインパッケージはダミーバイナリです
- 本番 API 実装時はレスポンス形式を合わせて移行できます
