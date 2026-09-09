# API 概要

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [認証 API](auth.md) / [プラットフォーム API](platform.md) / [管理 API](admin.md) / [エラー](errors.md)

バックエンドは 2 サービスです。ビューアの業務データは mock-api、ログイン資格情報は auth-api です。

## サービス

| サービス | ベース（開発） | 役割 |
|----------|----------------|------|
| Auth API | `http://localhost:3002` | ログイン、トークン、資格情報管理 |
| Mock API | `http://localhost:3001` | ユーザー、教材、本棚、注釈、ライセンス、管理 CRUD、LMS モック |

ブラウザからは Vite のプロキシ経由です。

| アプリ | ブラウザ上のパス | 転送先 |
|--------|------------------|--------|
| viewer | `/api/*` | mock-api |
| admin | `/api/auth/*` | auth-api |
| admin | `/api/mock/*` | mock-api |
| auth/web | 認証 API 直指定 | auth-api |

## 認証ヘッダ

保護されたエンドポイント:

```
Authorization: Bearer <accessToken>
```

開発用トークン:

| トークン | ロール |
|----------|--------|
| `mock-token-learner` | learner |
| `mock-token-instructor` | instructor |
| `mock-token-admin` | org_admin |

チャンク取得だけ追加ヘッダが必要です。

```
X-Session-Token: <view-sessions で得た sessionToken>
```

## 共通レスポンス

- 単一リソース: オブジェクトそのもの
- 一覧: `{ data: T[] }` またはページング `{ data, pagination }`
- 削除成功: `204` 本文なし
- 失敗: `{ error: string, message: string }` および任意の `hint`

ページングの `pagination` は `page` `limit` `total` `totalPages` です。

## バージョン

両 API の `GET /health` は `version: "0.1.0"` です。互換用の URL バージョンプレフィックス（`/v1`）はありません。

## 永続化

| データ | 永続 |
|--------|------|
| seed のユーザー・教材・ライセンス等 | 管理系更新で `seed.json` へ保存 |
| 資格情報 | `credentials.json` |
| 閲覧セッション、一部の注釈操作 | メモリ。再起動で消失しうる |

本番 API へ移すときは、この文書のパスと JSON 形を契約として合わせてください。
