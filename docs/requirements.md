# 学習用ビューア — 要件一覧と実装状況

B2B 向け PDF 学習プラットフォーム **manabu-kun** の要件と、現時点（2026-08）の実装状況です。

## 凡例

| 記号 | 意味 |
|------|------|
| ✅ | 実装済み（UI + API 連携） |
| 🔶 | 部分実装（API のみ / スキーマのみ / デモモード） |
| ❌ | 未実装 |
| ➖ | 対象外（今回スコープに含めない） |

**テスト**: Playwright E2E の有無（`viewer/e2e/`、現状 **36 テスト**）

---

## 1. プラットフォーム要件

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| B2B（組織単位・ロール） | ✅ | 組織名表示、learner / instructor / org_admin ロール、開発用トークン切替 | `bookshelf.spec.ts` |
| 課金・決済 | ➖ | スコープ外 | — |
| マルチテナント（組織分離） | 🔶 | Mock API seed で組織データあり。本番テナント分離は未 | `mock-api.spec.ts` |

---

## 2. 認証・アカウント

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| Bearer トークン認証 | ✅ | `Authorization` ヘッダー、Zustand + localStorage | `mock-api.spec.ts` |
| プロフィール取得 (`/users/me`) | ✅ | ヘッダーにユーザー名・ロール表示 | `bookshelf.spec.ts` |
| メールログイン (`/auth/login`) | 🔶 | API のみ。UI ログイン画面なし（開発用トークン切替） | — |
| LTI 起動 (`/auth/lti/launch`) | 🔶 | Mock API のみ。ビューア側未対応 | — |

---

## 3. ライセンス

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| ライセンス一覧 (`/licenses/me`) | 🔶 | Mock API のみ | — |
| 閲覧前ライセンス検証 | ✅ | ビューア起動時に `verifyLicense` | `mock-api.spec.ts` |
| オフラインライセンストークン | 🔶 | Mock API のみ | — |

---

## 4. 本棚・コンテンツ

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| 配布本棚一覧 | ✅ | `/` 本棚ページ、教材カード | `bookshelf.spec.ts` |
| 教材検索 | ✅ | タイトル・著者・タグ | `bookshelf.spec.ts` |
| カテゴリフィルタ | ✅ | 数学 / 英語 等 | `bookshelf.spec.ts` |
| 読書進捗バー | ✅ | カード上に進捗表示 | `bookshelf.spec.ts` |
| 最近読んだもの | ✅ | 横スクロールセクション | `bookshelf.spec.ts` |
| 教材詳細・目次 (TOC) | ✅ | ビューアサイドバーで目次ジャンプ | `viewer.spec.ts` |

---

## 5. PDF ビューア

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| PDF 表示 | ✅ | PDF.js（開発時 `sample.pdf`） | `viewer.spec.ts` |
| ページ送り（ボタン・キーボード） | ✅ | ← → キー、ツールバー | `viewer.spec.ts` |
| ページ番号直接入力 | ✅ | ツールバー | `viewer.spec.ts` |
| ズーム | ✅ | +/- ボタン | `viewer.spec.ts` |
| 見開き（2 ページ）表示 | ✅ | single / spread 切替 | `viewer.spec.ts` |
| 閲覧セッション | ✅ | `createViewSession`、sessionToken 保持 | `mock-api.spec.ts` |
| 暗号化チャンク取得・復号 | 🔶 | Mock API エンドポイントあり。ビューアはデモ PDF 固定 | — |
| 読書進捗の自動保存 | ✅ | ページ・ズーム・表示モードを API 保存 | `mock-api.spec.ts` |
| 本棚へ戻る | ✅ | ツールバーリンク | `viewer.spec.ts` |

---

## 6. 注釈・ハイライト

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| テキスト選択 → ハイライト | ✅ | 5 色、フローティングツールバー | `annotations.spec.ts` |
| ページメモ（note） | ✅ | NoteDialog | `annotations.spec.ts` |
| ブックマーク | ✅ | ワンクリック追加 | `viewer.spec.ts` |
| 注釈一覧・フィルタ | ✅ | サイドバー（タイプ別） | `annotations.spec.ts` |
| 注釈編集（色・メモ） | ✅ | EditAnnotationDialog | `annotations.spec.ts` |
| 注釈削除 | ✅ | 一覧から削除 | `annotations.spec.ts` |
| 注釈 API CRUD | ✅ | GET / POST / PUT / DELETE | `mock-api.spec.ts` |
| 注釈一括同期 | 🔶 | API + Dexie キュースキーマ。フラッシュ処理未 | — |
| 下線（underline） | ❌ | 型定義のみ | — |

---

## 7. オフライン

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| コンテンツメタデータキャッシュ | 🔶 | Dexie `cacheContent`（閲覧時に保存） | — |
| 進捗オフラインキュー | 🔶 | API 失敗時 `queueProgress`。再同期フラッシュ未 | — |
| 注釈オフラインキュー | 🔶 | Dexie スキーマのみ。UI から未使用 | — |
| オフラインパッケージ DL | 🔶 | Mock API + Dexie テーブル。UI・DL 未 | — |
| 端末登録 (`/devices`) | 🔶 | Mock API のみ | — |
| 完全オフライン閲覧 | ❌ | パッケージ復号・Service Worker 未 | — |

---

## 8. DRM・セキュリティ

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| ウォーターマーク表示 | ✅ | セッション / policy から PDF 上にオーバーレイ | — |
| DRM ポリシー取得 | ✅ | `/contents/:id/policy` | — |
| 印刷制御 (`allowPrint`) | ❌ | 型・seed のみ。UI 未反映 | — |
| コピー制御 (`allowCopy`) | ❌ | 型・seed のみ。選択禁止未 | — |
| スクリーンショット防止 | ❌ | policy フィールドのみ | — |

---

## 9. LMS 連携

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| Deep Link 起動 | 🔶 | Mock API `POST /lms/deep-link`。ビューア URL パラメータ未 | — |
| LTI 起動 → 教材表示 | ❌ | `/viewer/:id?page=` 等未対応 | — |
| 名簿同期 (`/lms/roster/sync`) | 🔶 | Mock API のみ | — |
| xAPI 学習記録 | 🔶 | Mock API のみ | — |

---

## 10. UI / UX

| 要件 | 状態 | 実装内容 | テスト |
|------|------|----------|--------|
| ダークモード | ✅ | localStorage 永続化 | `dark-mode.spec.ts` |
| モバイル対応 | ✅ | FAB、ボトムシートサイドバー | `mobile.spec.ts` |
| トースト通知 | ✅ | 注釈追加・削除等 | `annotations.spec.ts`（間接） |
| ローディング・空状態 | ✅ | Skeleton、EmptyState | `bookshelf.spec.ts` |
| アクセシビリティ (a11y) | 🔶 | data-testid 中心。ARIA 監査未 | — |

---

## 11. テスト・開発基盤

| 要件 | 状態 | 実装内容 |
|------|------|----------|
| Mock API | ✅ | Express、seed データ、全主要エンドポイント |
| Playwright E2E | ✅ | 36 テスト（chromium + mobile-chrome） |
| 機能追加時のテスト必須 | ✅ | `.cursor/rules/playwright-tests.mdc` |

---

## 次の実装優先度（viewer/README と同期）

1. 暗号化チャンク → PDF 復号パイプライン
2. オフラインパッケージの Dexie 保存と完全オフライン閲覧
3. 注釈・進捗同期キューのフラッシュ（オンライン復帰時）
4. LTI / Deep Link 起動（`/viewer/:id?page=`）
5. 印刷・コピー制御（`policy.drm` 反映）
6. 各項目に Playwright テスト追加（[ルール](../.cursor/rules/playwright-tests.mdc) 参照）

---

## 関連ドキュメント

- [viewer/README.md](../viewer/README.md) — 起動・機能サマリ
- [viewer/e2e/README.md](../viewer/e2e/README.md) — E2E テスト
- [mock-api/README.md](../mock-api/README.md) — API 仕様
