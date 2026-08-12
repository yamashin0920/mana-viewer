# マナビューア 認証サービス

ビューア・管理画面と **別プロジェクト** として実装した **認証** UI + API です。

## なぜポートが違うのにログインは1つ？

開発環境では各アプリが別ポートで動きますが、**ログイン画面は `auth/web`（5180）だけ**です。

| サービス | ポート | 役割 |
|---------|--------|------|
| **auth/web** | 5180 | **唯一のログイン画面** + セッション保持（SSO） |
| viewer | 5173 | ビューア（認可のみ） |
| admin/web | 5190 | 管理画面（認可のみ） |

ビューア・管理画面にはログイン画面がありません。未ログイン時は `auth/web` へ飛ばされ、**1回ログインすれば** auth/web のセッション経由でどのアプリにも再入力なしで入れます（SSO）。

本番では `auth.example.com` / `viewer.example.com` / `admin.example.com` のようにドメインを分けても、認証の入口は auth だけです。

## 認証と認可の分離

| レイヤ | 担当 | 内容 |
|--------|------|------|
| **認証** | `auth/api` + `auth/web` | ID/PW 検証、トークン発行、共通ログイン、セッション |
| **認可** | 各アプリ（viewer / admin） | ログイン後の権限チェック |

- **ビューア**: 認証済みなら利用可（`AuthGuard`）
- **管理画面**: `org_admin` / `content_admin` のみ（`canAccessAdmin`）。それ以外はアクセス拒否画面

## セッション（SSO）の流れ

1. ユーザーがビューア (5173) または管理画面 (5190) にアクセス
2. 未ログイン → `auth/web/login?redirect=...` へリダイレクト
3. **auth/web に有効なセッションがあれば** ログイン画面をスキップして元のアプリへ戻る
4. なければ ID/PW 入力 → auth/web がセッション保存 → `?accessToken=` 付きで元アプリへ
5. 各アプリはトークンを受け取り API 呼び出しに使用（認可チェックは各アプリ側）
6. ログアウト → `auth/web/logout` で**共通セッションを破棄**

## 構成

| パッケージ | ポート | 説明 |
|-----------|--------|------|
| `auth/api` | **3002** | 認証 API（ログイン、セッション検証） |
| `auth/web` | **5180** | 共通ログイン画面 + セッション管理 |

## 起動

```bash
./start-dev.sh
```

## API

```
POST /auth/login   { userId, password }  → { accessToken, user, ... }
GET  /auth/me      Authorization: Bearer  → { id, name, email, role, orgId }
POST /auth/refresh { refreshToken }      → { accessToken, ... }
GET  /auth/tokens                        → 開発用トークン一覧
GET  /health
```

ログイン可能な ID / パスワードは `auth/api/data/credentials.json` で管理します。

開発用アカウント例: `demo` / `demo`（学習者）、`instructor` / `instructor`、`admin` / `admin`

## テスト

```bash
cd auth/web && npm run test:e2e
```

## トラブルシューティング

```bash
./start-dev.sh --restart
curl http://localhost:3002/health
```

`authMode: "credentials-json"` と `credentialsCount: 3` が返れば正しい API が動いています。
