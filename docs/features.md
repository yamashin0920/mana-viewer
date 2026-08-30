# 現存する機能

マナビューア (mana-viewer) に **現時点で実装済み** の機能一覧です。コードを読んで確認した内容のみを記載しています。

未実装・要改善の項目は [improvements.md](improvements.md) にまとめています。要件全体との対応表は [requirements.md](requirements.md) を参照してください。

## 目次

- [システム構成](#システム構成)
- [認証・認可（auth）](#認証認可auth)
- [ビューア（viewer）](#ビューアviewer)
- [管理画面（admin/web）](#管理画面adminweb)
- [Mock API](#mock-api)
- [テスト](#テスト)

---

## システム構成

4 つのサブプロジェクトで構成されます。

| パッケージ | ポート | 役割 |
|---|---|---|
| `auth/api` | 3002 | 認証 API（ID/PW 検証、トークン発行、セッション） |
| `auth/web` | 5180 | 共通ログイン画面（唯一のログイン入口） |
| `viewer` | 5173 | 学習者向け PDF ビューア |
| `admin/web` | 5190 | 管理画面 |
| `mock-api` | 3001 | 業務 API のモック（Express + seed.json） |
| `packages/ui` | — | 共有 UI プリミティブとデザイントークン |
| `packages/contracts` | — | ドメイン型・ロール・管理権限の単一ソース |
| `packages/auth-client` | — | SSO リダイレクト・トークン・ApiError・AuthGuard |
| `packages/dev-data` | — | auth-api / mock-api が共有する開発用データアクセス層 |

npm workspaces による単一リポジトリです。依存関係はルートで一度インストールし、`./start-dev.sh` で一括起動します。

**技術スタック**: React 18 + Vite + TypeScript / PDF.js / TanStack Query / Zustand / Dexie / Tailwind CSS v4 / Express（モック） / Playwright

### 共有パッケージの役割

- **`@mana/contracts`** — `User` / `Content` / `License` などの型と、`can('contents:write')` などの権限表。admin UI と mock-api / auth-api のミドルウェアが同じ定義を参照する。Zod スキーマ（`@mana/contracts/node/schemas`）で書き込み API を実行時検証する
- **`@mana/auth-client`** — `redirectToLogin` / `AuthGuard` / `createApiFetch` / トークン保管。viewer と admin の重複を除去
- **`@mana/dev-data`** — seed / credentials の読み書きを 1 モジュールに集約。パスは `MANA_SEED_PATH` / `MANA_CREDENTIALS_PATH` で上書き可能

mock-api の Bearer トークン検証はファイルを直接読まず、`AUTH_API_URL/auth/me` へ HTTP で問い合わせます。admin 画面のデータ取得は TanStack Query です。

---

## 認証・認可（auth）

### 認証（auth/api + auth/web）

- **ID / パスワードログイン** — `POST /auth/login`。`auth/api/data/credentials.json` の資格情報と照合
- **共通ログイン画面** — ログイン UI は `auth/web` の 1 箇所のみ。viewer / admin にログイン画面は存在しない
- **SSO 的なセッション共有** — auth/web に有効なセッションがあればログイン画面をスキップし、`?accessToken=` を付けて元アプリへ戻す
- **プロフィール取得** — `GET /auth/me`
- **トークンリフレッシュ** — `POST /auth/refresh`
- **共通ログアウト** — `auth/web/logout` でセッション破棄
- **開発用トークン一覧** — `GET /auth/tokens`
- **ダークモード** — ログイン画面のテーマ切替（localStorage 保存）

### 認可（各アプリ側）

- **ビューア** — 認証済みであれば利用可（`viewer/src/components/auth/AuthGuard.tsx`）
- **管理画面** — `org_admin` / `content_admin` のみ許可。それ以外は専用のアクセス拒否画面（`admin/web/src/utils/authorization.ts`、`admin/web/src/components/auth/AccessDeniedPage.tsx`）
- **未ログイン時のリダイレクト** — 両アプリとも auth/web のログインへ遷移し、認証後に元の URL へ復帰
- **ロール** — `learner` / `instructor` / `org_admin` / `content_admin`

---

## ビューア（viewer）

### 本棚（`/`）

- 配布教材のカード一覧（表紙、タイトル、著者、カテゴリ）
- タイトル・著者・タグを対象としたキーワード検索
- カテゴリによる絞り込み
- カード上の読書進捗バー
- 「最近読んだもの」横スクロールセクション
- ヘッダーに組織名・ユーザー名・ロールを表示
- ローディング時のスケルトン表示、0 件時の EmptyState

### PDF 表示（`/viewer/:contentId`）

- PDF.js による PDF レンダリング
- ページ送り（ツールバーのボタン、← / → キー、PageUp / PageDown）
- ページ番号の直接入力によるジャンプ
- ズーム（+ / − ボタン、0.5〜2.5 倍、0.1 刻み）
- **見開き（2 ページ）表示** と 1 ページ表示の切替
- PDF 内テキスト検索（ヒットのハイライト、前後ナビゲーション、Ctrl+F 対応）
- PDF 内リンクアノテーションのクリック遷移（ページ内ジャンプ・外部 URL）
- 「本棚に戻る」リンク
- **ツールバーは部品の配置表**（`viewer/src/chrome/viewerToolbarPlacement.ts`）で並べる。注釈・表示切替・ズームは狭い画面では「ツール」を押して展開

### サイドバー

- **目次（TOC）** — API の目次データ、なければ PDF アウトラインをフォールバック。クリックでジャンプ、外部 URL にも対応
- **サムネイル一覧** — 2 列グリッド。クリックで該当ページへジャンプ
- **注釈一覧** — 種別タブでのフィルタ、クリックで該当ページへジャンプ、編集・削除
- モバイルではボトムシート型ドロワーとして開閉

### 注釈・ハイライト

| 種別 | 作成方法 |
|---|---|
| ハイライト | テキスト選択 → フローティングツールバー、またはマーカーツールでドラッグ（5 色） |
| ページメモ（note） | ツールバーまたは選択ツールバーから `NoteDialog` |
| ブックマーク | ツールバーからワンクリック追加 |
| ペン描画（drawing） | ペンツールでフリーハンド描画（5 色） |
| 付箋（sticky） | 付箋ツールでクリック配置 |

- **編集** — 色・メモの変更（`EditAnnotationDialog`）
- **削除** — 注釈一覧から削除
- **表示切替** — 注釈の一括表示/非表示、種別ごとの表示切替メニュー
- **エクスポート** — JSON / Markdown 形式でダウンロード
- **共有リンク** — 共有 URL を発行し、`?share=` 付き URL で他ユーザーが閲覧可能
- API による CRUD（GET / POST / PUT / DELETE）

### 進捗・セッション

- 閲覧開始時に `createViewSession` で閲覧セッションを作成し、`X-Session-Token` をチャンク取得に付与
- `VITE_USE_DEMO_PDF=false` のとき `GET /contents/:id/chunks/:page` を呼び、モックチャンクなら `sample.pdf` にフォールバックして PDF.js へ渡す
- 起動時にライセンス検証（`verifyLicense`）を実行し、`canView` が false なら閲覧不可画面を表示
- 現在ページ・ズーム・表示モードを API へ自動保存
- 再訪時に保存済みのページ・ズーム・表示モードを復元
- 保存失敗時は Dexie の進捗キューへ退避し、オンライン復帰時にフラッシュ
- 注釈の保存失敗時も Dexie キューへ退避
- 教材メタデータを Dexie にキャッシュ

### DRM

- **ウォーターマーク表示** — セッション / ポリシーの情報を PDF 上にオーバーレイ
- DRM ポリシーの取得（`GET /contents/:id/policy`）
- **印刷制御** — `allowPrint: false` のとき Ctrl/Cmd+P と `@media print` をブロック
- **コピー制御** — `allowCopy: false` のとき copy / cut を防止（アプリ内ハイライト用のテキスト選択は残す）

### UI 全般

- ダークモード（localStorage で永続化、OS 設定も反映）
- モバイル対応（FAB、ボトムシート型サイドバー、ブレークポイントによるレイアウト切替）
- トースト通知（注釈の追加・削除・エラー）
- スケルトン / スピナー / EmptyState

---

## 管理画面（admin/web）

サイドバーナビゲーションを持つ 3 ページ構成です。`/` は `/accounts` へリダイレクトします。

### アカウント（`/accounts`）

**ログインアカウント（auth/api）** — 一覧 / 作成 / 更新 / 削除

- 一覧: ログイン ID、紐づくユーザー、ロール、ライセンス数
- 作成・更新: ログイン ID、パスワード、紐づけるユーザー
- 紐づけ候補はまだ資格情報を持たないユーザーのみに絞り込み
- 削除時は確認ダイアログ

**ユーザー（mock-api）** — 一覧 / 作成 / 更新 / 削除

- 一覧: 氏名、メールアドレス、ロール、割当ライセンス（無効ライセンスにはバッジ表示）
- 作成・更新: 氏名、メールアドレス、ロール（4 種）
- **ライセンス割当** — ユーザーごとのチェックボックスパネル。座席上限に達したライセンスは選択不可

### ライセンス（`/licenses`）

- 一覧 / 作成 / 更新 / 削除
- 一覧: 対象コンテンツ、座席数、割当済みユーザー数、有効期間、ステータス
- 作成・更新: コンテンツ、座席数、開始日・終了日、オフライン可否、割当ユーザー
- 更新時のみステータス（active / expired など）を変更可能
- 割当ユーザーはチップ形式のチェックボックスで選択し、座席数の上限で制限

### コンテンツ（`/contents`）

- 一覧 / 作成 / 更新 / 削除（カードグリッド表示）
- 一覧: 表紙、タイトル、著者、カテゴリ、ステータス、ページ数
- 作成・更新: タイトル、表紙タイトル、著者、カテゴリ、ページ数、ステータス（published / draft / archived）、説明
- DRM ポリシー編集: `allowPrint` / `allowOffline` / `offlineDays` / `maxDevices`
- 削除時は関連ライセンスも API 側で連動削除

### 共通

- 管理者ロールによるアクセス制御
- 一覧データは TanStack Query で取得し、書き込み後にキャッシュを無効化
- ダークモード切替（※ 永続化されない。[improvements.md](improvements.md) 参照）
- ログアウト

---

## Mock API

Express + `data/seed.json` による業務 API のモックです。UI から使われていないエンドポイントも含め、以下が実装済みです。

| 領域 | 主なエンドポイント |
|---|---|
| 認証 | `POST /auth/login`、`POST /auth/lti/launch` |
| ユーザー | `GET /users/me`、組織 / グループ参照 |
| 本棚 | `GET /bookshelves`、本棚・アイテムの CRUD |
| コンテンツ | 一覧・詳細・目次・ポリシー・閲覧セッション・暗号化チャンク・**オフラインパッケージ** |
| 進捗 | 取得・保存・**一括同期** |
| 注釈 | CRUD、**一括同期**、共有リンク |
| ライセンス | `GET /licenses/me`、**オフライントークン**、組織ライセンス管理 |
| 端末 | 端末の登録・一覧・削除 |
| LMS | Deep Link、名簿同期、コース教材、**xAPI ステートメント** |
| 管理 | ユーザー / ライセンス / コンテンツの CRUD、ライセンス割当 |

太字はビューア・管理画面から未使用のものです（詳細は [improvements.md](improvements.md)）。

---

## テスト

Playwright による E2E テストが **148 件** あります（viewer 87 + admin/web 55 + auth/web 6）。

| 対象 | ファイル | 件数 |
|---|---|---|
| 注釈 | `viewer/e2e/annotations.spec.ts` | 19 |
| PDF ビューア | `viewer/e2e/viewer.spec.ts` | 13 |
| Mock API | `viewer/e2e/mock-api.spec.ts` | 16 |
| アクセシビリティ | `viewer/e2e/a11y.spec.ts` | 12 |
| モバイル UI | `viewer/e2e/mobile.spec.ts` | 9 |
| 本棚 | `viewer/e2e/bookshelf.spec.ts` | 6 |
| 閲覧権限・透かし | `viewer/e2e/access.spec.ts` | 3 |
| チャンク配信・DRM | `viewer/e2e/drm.spec.ts` | 3 |
| ダークモード | `viewer/e2e/dark-mode.spec.ts` | 3 |
| 進捗 | `viewer/e2e/progress.spec.ts` | 2 |
| ユーザー切替 | `viewer/e2e/user-switch.spec.ts` | 1 |
| 管理 API | `admin/web/e2e/admin-api.spec.ts` | 18 |
| 管理: アカウント | `admin/web/e2e/accounts.spec.ts` | 9 |
| 管理: ロール・エラー | `admin/web/e2e/permissions.spec.ts` | 7 |
| 管理: コンテンツ | `admin/web/e2e/contents.spec.ts` | 6 |
| 管理: ライセンス | `admin/web/e2e/licenses.spec.ts` | 5 |
| 管理: 共有 UI | `admin/web/e2e/shared-ui.spec.ts` | 4 |
| 管理: ログイン | `admin/web/e2e/login.spec.ts` | 3 |
| 管理: ナビゲーション | `admin/web/e2e/navigation.spec.ts` | 3 |
| 認証: ログイン | `auth/web/e2e/login.spec.ts` | 6 |

```bash
cd viewer && npm run test:e2e
cd admin/web && npm run test:e2e
cd auth/web && npm run test:e2e
```

機能追加時のテスト追加は [`.cursor/rules/playwright-tests.mdc`](../.cursor/rules/playwright-tests.mdc) でルール化されています。
