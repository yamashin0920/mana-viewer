# マナビューア 認証サービス

ビューア・管理画面と **別プロジェクト** として実装した **認証** UI + API です。

## 認証と認可の分離

| レイヤ | 担当 | 内容 |
|--------|------|------|
| **認証** | `auth/api` + `auth/web` | ID/PW 検証、トークン発行、共通ログイン画面 |
| **認可** | 各アプリ（viewer / admin） | ログイン後の権限チェック |

- **ビューア**: 認証済みなら利用可（`AuthGuard`）
- **管理画面**: `org_admin` / `content_admin` のみ（`canAccessAdmin`）。それ以外はアクセス拒否画面

各アプリは未ログイン時に `auth/web` へ `?redirect=` 付きでリダイレクトし、ログイン成功後に `?accessToken=` 付きで戻ります。トークンは `localStorage.accessToken` に保存（アプリ間で共通キー）。

## 構成

| パッケージ | ポート | 説明 |
|-----------|--------|------|
| `auth/api` | **3002** | 認証 API（ログイン、トークン発行） |
| `auth/web` | **5180** | 共通ログイン画面（React + Vite） |

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

### ビューア

1. ユーザーがビューア (`http://localhost:5173`) にアクセス
2. 未ログイン → **認証アプリ** (`http://localhost:5180/login?redirect=...`) へリダイレクト
3. ID / PW を入力（`auth/api/data/credentials.json` に登録された組み合わせのみ成功）
4. 認証成功 → ビューアへ `?accessToken=...` 付きでリダイレクト
5. ビューアがトークンを保存し、本棚を表示

### 管理画面

1. ユーザーが管理画面 (`http://localhost:5190`) にアクセス
2. 未ログイン → 同じ **認証アプリ** へリダイレクト（行き先ラベル: 「管理画面」）
3. 認証成功 → 管理画面へ `?accessToken=...` 付きでリダイレクト
4. **認可チェック**: 管理者ロールなら管理 UI、それ以外はアクセス拒否画面

開発用アカウント例: `demo` / `demo`（学習者）、`instructor` / `instructor`、`admin` / `admin`

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

## トラブルシューティング

ログインが `credentials.json` 以外でも通る場合、**古い Auth API プロセス**がポート 3002 を占有している可能性があります。

```bash
./start-dev.sh --restart
curl http://localhost:3002/health
```

`authMode: "credentials-json"` と `credentialsCount: 3` が返れば正しい API が動いています。
