# 認証 API

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [API 概要](overview.md) / [認証機能](../features/auth.md) / [管理 API](admin.md)

サービス: `auth/api`（開発時 `http://localhost:3002`）。資格情報の正は `auth/api/data/credentials.json` です。ユーザー属性（名前・ロール）は mock-api の seed から読みます。

## 公開

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/health` | 不要 | `authMode: "credentials-json"` と登録件数 |
| GET | `/` | 不要 | エンドポイント案内 |
| POST | `/auth/login` | 不要 | ID/PW → トークン |
| POST | `/auth/refresh` | 不要 | リフレッシュトークン |
| GET | `/auth/me` | Bearer | ログイン中ユーザー |
| GET | `/auth/tokens` | 不要 | 開発用トークン一覧 |

## POST `/auth/login`

ボディ: `{ "userId": "demo", "password": "demo" }` または `email` フィールドにログイン ID。

成功:

```json
{
  "accessToken": "mock-token-learner",
  "refreshToken": "refresh-mock-token-learner",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "user-001",
    "email": "tanaka@tokyo-gakuen.example.jp",
    "name": "田中 太郎",
    "role": "learner",
    "orgId": "org-001"
  }
}
```

失敗: 400 / 401 `invalid_credentials`。seed に紐付けユーザーが無いときは 500 `user_not_found`。

## POST `/auth/refresh`

ボディ: `{ "refreshToken": "refresh-<accessToken>" }`。`refresh-` で始まらないと 401 です。

## GET `/auth/me`

`Authorization: Bearer` 必須。id, email, name, role, orgId を返します。

## 資格情報管理（管理画面から）

ベース: `/admin/credentials`。詳細は [管理 API](admin.md) の Auth 側を参照してください。

| メソッド | パス | 権限 |
|----------|------|------|
| GET | `/admin/credentials` | org_admin / content_admin |
| POST | `/admin/credentials` | org_admin |
| PUT | `/admin/credentials/:loginId` | org_admin |
| DELETE | `/admin/credentials/:loginId` | org_admin |

制約:

- ログイン ID とユーザーは 1 対 1
- ログイン ID `admin` は削除不可
- パスワードは JSON 平文（開発専用）

## 開発用アカウント

| loginId | password | token | linkedUserId |
|---------|----------|-------|--------------|
| demo | demo | mock-token-learner | user-001 |
| instructor | instructor | mock-token-instructor | user-002 |
| admin | admin | mock-token-admin | user-admin |
