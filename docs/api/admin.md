# 管理 API

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [認証 API](auth.md) / [管理画面機能](../features/admin.md) / [ライセンス](../features/licenses.md)

管理画面は 2 つのバックエンドを呼びます。いずれも Bearer 必須です。

- 資格情報: auth-api `/admin/credentials*`
- ユーザー・教材・ライセンス: mock-api `/admin/*`

## 権限

| ロール | 管理画面 | ユーザー CRUD / ライセンス発行 | 教材 CRUD | 資格情報 CRUD |
|--------|----------|--------------------------------|-----------|----------------|
| org_admin | 可 | 可 | 可 | 可 |
| content_admin | 可 | ユーザー一覧・教材は可。ユーザー削除・ライセンス発行は org_admin | 作成・更新可。削除は org_admin | 一覧のみ |
| learner / instructor | 不可（403 画面） | — | — | — |

ミドルウェア:

- `adminMiddleware`: `org_admin` または `content_admin`
- `orgAdminMiddleware`: `org_admin` のみ

操作対象は呼び出し元ユーザーと同じ `orgId` に限ります。

## Auth API

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET | `/admin/credentials` | admin | `{ data, users }` |
| POST | `/admin/credentials` | org_admin | `{ loginId, password, linkedUserId }` |
| PUT | `/admin/credentials/:loginId` | org_admin | `password` `linkedUserId` `newLoginId` |
| DELETE | `/admin/credentials/:loginId` | org_admin | `admin` は削除不可 |

409 `duplicate`: ログイン ID 重複、または既に資格情報があるユーザー。

## Mock API — ユーザー

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET | `/admin/users` | admin | ライセンス割当付き一覧 |
| POST | `/admin/users` | org_admin | `{ name, email, role }` |
| PUT | `/admin/users/:userId` | org_admin | プロフィール更新 |
| DELETE | `/admin/users/:userId` | org_admin | 自分自身は削除不可。割当からも外す |
| PUT | `/admin/users/:userId/licenses` | org_admin | `{ licenseIds: string[] }` 席不足は 409 |

ロール値: `learner` `instructor` `org_admin` `content_admin`。

## Mock API — ライセンス

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET | `/admin/licenses` | admin | 教材・割当ユーザー・残席付き |
| POST | `/admin/licenses` | org_admin | `{ contentId, seatCount, startsAt, expiresAt, allowOffline, status, assignedUserIds }` |
| PUT | `/admin/licenses/:licenseId` | org_admin | 更新 |
| DELETE | `/admin/licenses/:licenseId` | org_admin | 削除 |
| POST | `/admin/licenses/:licenseId/assign` | org_admin | `{ userIds, action: "add" \| "remove" }` |

既定の有効期間は作成日から 1 年です。席数は 1 以上。割当人数が席を超えると 400 です。

## Mock API — 教材

| メソッド | パス | 権限 | 説明 |
|----------|------|------|------|
| GET | `/admin/contents` | admin | 組織の全ステータス |
| POST | `/admin/contents` | org_admin / content_admin | タイトル必須。カバー未指定ならプレースホルダ生成 |
| PUT | `/admin/contents/:contentId` | admin | メタデータ・policy。title/coverTitle 変更時はカバー再生成（coverUrl 未指定なら） |
| DELETE | `/admin/contents/:contentId` | org_admin | 関連ライセンスも削除 |

ステータス例: `draft` `published` `archived`。学習者一覧に出るのは `published` かつライセンスありです。
