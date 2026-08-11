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
3. ID / PW を入力（開発用: 任意の非空値で OK）
4. 認証成功 → ビューアへ `?accessToken=...` 付きでリダイレクト
5. ビューアがトークンを保存し、本棚を表示

## API

```
POST /auth/login   { userId, password }  → { accessToken, user, ... }
GET  /auth/tokens                        → 開発用トークン一覧
GET  /health
```

## テスト

```bash
cd auth/web && npm install && npm run test:e2e
```
