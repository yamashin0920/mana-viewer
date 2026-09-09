# DRM・オフライン・LMS

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [セキュリティ](../security.md) / [プラットフォーム API](../api/platform.md) / [要件](../requirements.md)

ビューアの本線から外れた、またはモック止まりの領域です。実装時はここと要件表を同時に更新します。

## DRM

| 項目 | 状態 | 実装 |
|------|------|------|
| ポリシー取得 | ✅ | `GET /contents/:id/policy` |
| ウォーターマーク | ✅ | セッション / policy を PDF オーバーレイ |
| 暗号化フラグ | 🔶 | `drm.encrypted` 等。実復号なし |
| 印刷 | ❌ | seed の `allowPrint` のみ |
| コピー | ❌ | `allowCopy` 未反映 |
| スクリーンショット | ❌ | `allowScreenshot` 未反映 |

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

| 項目 | 状態 | 実装 |
|------|------|------|
| Deep Link 生成 | 🔶 | `POST /lms/deep-link`。返す URL は mock-api ホスト |
| LTI launch | 🔶 | mock-api `/auth/lti/launch`。ビューア未接続 |
| 名簿同期 | 🔶 | 固定メッセージ |
| xAPI | 🔶 | 受信して ID を返すだけ |
| ビューア `?page=` 起動 | ❌ | |

## テスト

API の一部は `viewer/e2e/mock-api.spec.ts`。オフライン再生と LTI 画面の E2E はありません。

## 次の実装時の注意

1. チャンク復号を入れるときは `VITE_USE_DEMO_PDF` の切替とセッションヘッダを必須にする
2. キューフラッシュはオンライン検知（`navigator.onLine`）とリトライ方針を決めてから UI を出す
3. LTI は auth サービスとのセッション結合が必要。mock の launch をビューアに直結しない
