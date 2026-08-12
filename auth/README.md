# manabu-kun 認証サービス

ビューアとは **別プロジェクト** として実装した認証 UI + API です。

## 構成

| パッケージ | ポート | 説明 |
|-----------|--------|------|
| `auth/api` | **3002** | 認証 API（ログイン、トークン発行） |
| `auth/web` | **5180** | ログイン画面（React + Vite） |

## 起動

リポジトリルートから:

```bash
./start-dev.sh
```

個別起動:

```bash
# 認証 API
cd auth/api && npm install && npm start

# ログイン画面
cd auth/web && npm install && npm run dev
```

## フロー

1. ユーザーがビューア (`http://localhost:5173`) にアクセス
2. 未ログイン → **認証アプリ** (`http://localhost:5180/login?redirect=...`) へリダイレクト
3. ID / PW を入力（`auth/api/data/credentials.json` に登録された組み合わせのみ成功）
4. 開発用アカウント例: `demo` / `demo`（学習者）、`instructor` / `instructor`、`admin` / `admin`
5. 認証成功 → ビューアへ `?accessToken=...` 付きでリダイレクト
6. ビューアがトークンを保存し、本棚を表示

## API

```
POST /auth/login   { userId, password }  → { accessToken, user, ... }
GET  /auth/tokens                        → 開発用トークン一覧
GET  /health
```

ログイン可能な ID / パスワードは `auth/api/data/credentials.json` で管理します。

```json
[
  { "userId": "demo", "password": "demo", "token": "mock-token-learner" }
]
```

`token` は mock-api の seed ユーザーに対応する開発用トークンです。

## テスト

```bash
cd auth/web && npm install && npm run test:e2e
```
