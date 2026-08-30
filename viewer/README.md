# viewer

マナビューア PDF ビューア（React + Vite + TypeScript + PDF.js）

## 技術スタック

- React 18 + Vite + TypeScript
- PDF.js — PDF レンダリング
- TanStack Query — API 通信
- Zustand — 認証状態
- Dexie — オフラインキャッシュ / 同期キュー
- Tailwind CSS — スタイル

## 起動

**1. Mock API（別ターミナル）**

```bash
cd mock-api && npm start
# → http://localhost:3001
```

**2. ビューア**

```bash
cd viewer && npm install && npm run dev
# → http://localhost:5173
```

Vite の proxy 経由で `/api` → mock-api (3001) に転送されます。

## 機能（現時点）

- **本棚** — 教材カード一覧、検索・カテゴリフィルタ、読書進捗バー
- **PDF ビューア** — ページ送り（← → キー対応）、ズーム、サムネイル一覧、目次ジャンプ、テキスト検索、PDF内リンク
- **注釈** — テキスト選択 → カラーツールバー → ハイライト / メモ、ペン描画、付箋
- **ブックマーク** — ワンクリック追加、注釈パネルでフィルタ・削除
- **進捗保存** — API へ自動保存（失敗時 Dexie キュー、オンライン復帰でフラッシュ）
- **DRM** — ウォーターマーク、印刷ブロック、クリップボード copy/cut ブロック
- **モバイル対応** — ボトムシート型サイドバー、FAB ボタン
- **トースト通知** — 注釈追加・削除のフィードバック
- **ダークモード** — ヘッダーの月/太陽アイコンで切替（localStorage 保存）
- **見開き表示** — ツールバーで 1 ページ / 2 ページ切替
- **注釈編集** — 注釈パネルの鉛筆アイコンから色・メモを編集
- **最近読んだもの** — 本棚上部に横スクロールセクション

## 開発用 PDF について

`VITE_USE_DEMO_PDF=true`（開発の既定）では `public/sample.pdf` を直接表示します。

`VITE_USE_DEMO_PDF=false`（E2E の既定）では閲覧セッション付きでチャンク API を呼びます。モックチャンクは PDF 本体を含まないため、ヘッダ検証後に `sample.pdf` へフォールバックします。本番 API ではここで AES-GCM 復号する想定です。

## 画面構成

```
/                 本棚（教材一覧）
/viewer/:contentId  PDF ビューア
```

## 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `VITE_API_BASE_URL` | `/api` | API ベース URL |
| `VITE_USE_DEMO_PDF` | `true` | `true` なら sample.pdf 直読み。`false` ならチャンク API 経由 |

## ビューア開発の次のステップ

- [x] 暗号化チャンク取得とセッション検証（モック時は sample.pdf フォールバック）
- [x] 注釈・進捗同期キューのフラッシュ
- [ ] 本番相当の AES-GCM 復号パイプライン
- [ ] オフラインパッケージの Dexie 保存
- [ ] LTI 起動パラメータ対応（`/viewer/:id?page=`）

## テスト（Playwright）

```bash
cd viewer
npm run test:e2e
```

mock-api と viewer を自動起動して E2E テスト（36件）を実行します。詳細は [`e2e/README.md`](e2e/README.md)。

**ルール**: 機能を追加・変更したら Playwright テストも追加すること（[../.cursor/rules/playwright-tests.mdc](../.cursor/rules/playwright-tests.mdc)）。

## 要件と実装状況

[../docs/requirements.md](../docs/requirements.md)
