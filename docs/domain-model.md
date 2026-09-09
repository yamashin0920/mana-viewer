# ドメインモデル

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [用語集](glossary.md) / [プラットフォーム API](api/platform.md) / [管理 API](api/admin.md)

主要なエンティティと関係です。正は `mock-api/data/seed.json` と `viewer/src/types/index.ts`、`admin/web/src/types/index.ts` です。

## 関係の概要

```
Organization 1 ─┬─ * User
                ├─ * Group
                ├─ * Content
                ├─ * License
                ├─ * Bookshelf
                └─ * LmsPlatform

User * ── * License（assignedUserIds）
Content 1 ── * License
Content 1 ── * Annotation（user ごと）
Content 1 ── 1 Toc[]
User 1 ── * Device
User 1 ── * Progress（content ごと）
```

## 組織 (Organization)

テナント。開発 seed は「東京学習高等学校」（`org-001`）のみです。設定に最大席数、オフライン端末数、ブランディングを持ちます。API の一覧は自組織にフィルタします。本番の厳密なテナント分離は 🔶 です。

## ユーザー (User)

| フィールド | 説明 |
|------------|------|
| `id` | `user-001` 形式 |
| `orgId` | 所属組織 |
| `email` | 表示・LMS 連携用。ログイン ID ではない |
| `name` | 表示名 |
| `role` | `learner` / `instructor` / `org_admin` / `content_admin` |
| `externalId` | LMS 側 ID |

ログインそのものは User ではなく **資格情報 (Credential)** です。`loginId` + `password` が `linkedUserId` で User に紐づきます。

## 教材 (Content)

公開状態 `published` の教材だけが学習者の一覧に出ます。`policy` が DRM の入力です。

| ポリシー | 意味 | UI 反映 |
|----------|------|---------|
| `allowPrint` | 印刷許可 | ✅ 管理 OK/NG、ビューア反映 |
| `allowOffline` | オフライン許可 | API のみ 🔶 |
| `offlineDays` | オフライン有効日数 | API のみ 🔶 |
| `maxDevices` | 端末上限 | API のみ 🔶 |
| `watermarkText` | 透かしテンプレート | ✅ オーバーレイ |

`coverTitle` は表紙プレースホルダ画像の文字です。タイトル変更時にカバー URL を再生成します。

## ライセンス (License)

組織が教材に対して持つ利用権です。

- `seatCount`: 割り当てられる人数の上限
- `assignedUserIds`: 実際の割当
- `startsAt` / `expiresAt` / `status`（`active` など）
- `allowOffline`: ライセンス側のオフライン可否

閲覧は「有効なライセンスがユーザーに割り当てられている」ことが条件です。席が埋まっていると 409 `seats_exhausted` です。

## 本棚 (Bookshelf)

| `type` | 意味 |
|--------|------|
| `distributed` | 組織配布。学習者はアイテム変更不可 |
| `recent` | 最近読んだもの用の種別（画面は進捗から構成） |
| `favorites` / `custom` | カスタム棚。POST で作成可能 |

アイテムはライセンスのない教材を除外して返します。

## 進捗 (Progress)

ユーザー × 教材。`currentPage`、`progressPercent`、`zoom`、`viewMode`、`lastReadAt`、`totalReadSeconds`。ビューアがページ移動や終了時に PUT します。

## 注釈 (Annotation)

ユーザー × 教材。タイプは `highlight` / `bookmark` / `note` / `underline` / `drawing` / `sticky`。座標は PDF ポイント系の `rects`。共有は `annotationShares` で注釈 ID の集合と期限を持ちます。

## 閲覧セッション (ViewSession)

30 分期限の `sessionToken`。チャンク取得時に `X-Session-Token` が必要です。開発の PDF 表示はこのセッションを作りますが、実バイトはデモ PDF です。

## 端末 (Device)

オフライン用。組織の `maxOfflineDevices` が登録上限です。パッケージ発行前に登録が必要です。完全オフライン閲覧は ❌ です。

## グループ / LMS

`Group` はクラス相当で `externalCourseId` を持てます。`LmsPlatform` は LTI 設定の入れ物です。画面からの本格運用は未実装で、Mock API が受け口です。
