# プラットフォーム API（Mock API）

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [API 概要](overview.md) / [エラー](errors.md) / [ドメインモデル](../domain-model.md)

サービス: `mock-api`（開発時 `http://localhost:3001`）。特記なきエンドポイントは `Authorization: Bearer` 必須です。ログイン発行は auth-api 側です。mock-api の `POST /auth/login` は残っていても、開発フローでは使いません。

管理 CRUD（`/admin/*`）は [管理 API](admin.md) です。

## ヘルス

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/health` | 不要 | `{ status, service, version }` |
| GET | `/` | 不要 | エンドポイント案内 |

## ユーザー / 組織

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET | `/users/me` | ログイン済み | プロフィール + organization |
| GET | `/users/organizations/:orgId` | 自組織 | 組織詳細 |
| GET | `/users/organizations/:orgId/members` | 自組織 | メンバー一覧 |
| GET | `/users/organizations/:orgId/groups` | 自組織 | グループ一覧 |
| POST | `/users/organizations/:orgId/groups` | org_admin / instructor | グループ作成 |

## ライセンス（学習者向け）

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/licenses/me` | 自分に割り当てられたライセンス |
| POST | `/licenses/verify` | `{ contentId }` → `allowed` / `canView` / `canDownloadOffline` |
| POST | `/licenses/offline-token` | `{ contentId, deviceId }` オフライントークン 🔶 |
| GET | `/licenses/organizations/:orgId/licenses` | instructor / org_admin |
| POST | `/licenses/organizations/:orgId/licenses/:licenseId/assign` | org_admin |

閲覧前にビューアは `verify` を呼びます。

## 教材・閲覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/contents` | 公開済み + ライセンスあり。`q` `category` ページング |
| GET | `/contents/:id` | 詳細 + TOC + 進捗 |
| GET | `/contents/:id/toc` | 目次のみ |
| GET | `/contents/:id/policy` | DRM ポリシー + watermark |
| POST | `/contents/:id/view-sessions` | セッション作成（約 30 分） |
| GET | `/contents/:id/chunks/:page` | 暗号化チャンク。`X-Session-Token` 必須。開発はダミー |
| POST | `/contents/:id/offline-packages` | `{ deviceId }` 🔶 |
| GET / PUT | `/contents/:id/progress` | 読書進捗 |
| POST | `/contents/:id/progress/sync` | 進捗一括同期 🔶 |

`GET /contents` の検索はタイトル・著者・タグです。

## 本棚

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/bookshelves` | 組織の棚 + アイテム（ライセンスでフィルタ） |
| GET | `/bookshelves/:id` | 1 棚 |
| GET | `/bookshelves/:id/items` | アイテム |
| POST | `/bookshelves` | カスタム棚 |
| POST | `/bookshelves/:id/items` | アイテム追加（配布棚は 403） |
| DELETE | `/bookshelves/:id/items/:contentId` | アイテム削除（配布棚は 403） |

## 注釈

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/contents/:id/annotations` | 自分の注釈 |
| POST | `/contents/:id/annotations` | 作成。type は highlight, bookmark, note, underline, drawing, sticky |
| POST | `/contents/:id/annotations/sync` | 一括同期 🔶 |
| POST | `/contents/:id/annotations/share` | 共有リンク。任意で `annotationIds` `expiresInDays`（1〜30、既定 7） |
| GET | `/annotations/shared/:shareId` | 共有取得。認証任意。期限切れは 410 |
| PUT | `/annotations/:annotationId` | 所有者のみ |
| DELETE | `/annotations/:annotationId` | 所有者のみ |

共有 URL の形: `/viewer/:contentId?share=:shareId`。

## 端末

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/devices/me` | 自分の端末 |
| POST | `/devices/register` | `{ name, platform, deviceFingerprint }` |
| DELETE | `/devices/:deviceId` | 登録解除 |
| POST | `/devices/:deviceId/heartbeat` | lastSeenAt 更新 |

組織の `maxOfflineDevices` を超えると 403 `device_limit`。

## LMS 🔶

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET / POST | `/lms/platforms` | 参照は instructor 以上、作成は org_admin | プラットフォーム |
| GET | `/lms/courses` | ログイン済み | コース一覧。学習者は所属コースのみ |
| GET | `/lms/courses/:id` | ログイン済み | コース詳細・教材・メンバー |
| POST | `/lms/launch` | ログイン済み + ライセンス | ビューア起動 URL（`page` `lmsLaunch`） |
| POST | `/lms/deep-link` | ログイン済み + ライセンス | launch と同じ URL 形 |
| POST | `/lms/roster/sync` | instructor 以上 | 名簿同期モック |
| GET | `/lms/courses/:id/materials` | ログイン済み | コース教材 |
| GET / POST | `/lms/xapi/statements` | ログイン済み | 学習記録の一覧 / 受信 |

## curl 例

```bash
TOKEN=mock-token-learner

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/bookshelves
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/contents

curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentId":"content-001"}' \
  http://localhost:3001/licenses/verify

curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/contents/content-001/view-sessions
```
