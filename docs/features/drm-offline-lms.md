# DRM・オフライン・LMS

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [セキュリティ](../security.md) / [LMS 連携](lms.md) / [プラットフォーム API](../api/platform.md)

DRM とオフラインの状態です。LMS の画面・起動は [LMS 連携](lms.md) が正本です。

## DRM

| 項目 | 状態 | 実装 |
|------|------|------|
| ポリシー取得 | ✅ | `GET /contents/:id/policy` |
| ウォーターマーク | ✅ | セッション / policy を PDF オーバーレイ |
| 印刷 OK/NG | ✅ | 管理画面で設定。ビューアはボタン表示と Ctrl+P 抑止 |
| 暗号化フラグ | 🔶 | `drm.encrypted` 等。実復号なし |
| コピー | ❌ | `allowCopy` 未反映 |
| スクリーンショット | ❌ | `allowScreenshot` 未反映 |

印刷の詳細は [ビューア](viewer.md) と [管理画面](admin.md)。テスト: `viewer/e2e/print.spec.ts`、`admin/web/e2e/contents.spec.ts`。

## オフライン

| 項目 | 状態 | 実装 |
|------|------|------|
| メタデータキャッシュ | 🔶 | Dexie `cacheContent` |
| 進捗キュー | 🔶 | API 失敗時 `queueProgress`。復帰フラッシュなし |
| 注釈キュー | 🔶 | スキーマのみ |
| 端末登録 API | 🔶 | `/devices*` |
| パッケージ API | 🔶 | ダミーバイナリ |
| 完全オフライン閲覧 | ❌ | SW・復号なし |

## LMS

[LMS 連携](lms.md) を参照。Web アプリ `lms/web`（:5200）と `POST /lms/launch` でビューア起動まで実装済みです。
