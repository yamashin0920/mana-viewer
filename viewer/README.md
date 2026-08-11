# viewer

manabu-kun PDF ビューア（React + Vite + TypeScript + PDF.js）

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
- **PDF ビューア** — ページ送り（← → キー対応）、ズーム、サムネイル一覧、目次ジャンプ
- **注釈** — テキスト選択 → カラーツールバー → ハイライト / メモ
- **ブックマーク** — ワンクリック追加、注釈パネルでフィルタ・削除
- **進捗保存** — API へ自動保存（失敗時 Dexie キュー）
- **DRM 表示** — ウォーターマークオーバーレイ
- **モバイル対応** — ボトムシート型サイドバー、FAB ボタン
- **トースト通知** — 注釈追加・削除のフィードバック
- **ダークモード** — ヘッダーの月/太陽アイコンで切替（localStorage 保存）
- **見開き表示** — ツールバーで 1 ページ / 2 ページ切替
- **注釈編集** — 注釈パネルの鉛筆アイコンから色・メモを編集
- **最近読んだもの** — 本棚上部に横スクロールセクション

## 開発用 PDF について

Mock API の PDF チャンクはダミーバイナリのため、開発時は `public/sample.pdf` を表示します（`VITE_USE_DEMO_PDF=true`）。

本番 API 接続時は `VITE_USE_DEMO_PDF=false` にし、暗号化チャンクからの復号ロジックに差し替えてください。

## 画面構成

```
/                 本棚（教材一覧）
/viewer/:contentId  PDF ビューア
```

## 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `VITE_API_BASE_URL` | `/api` | API ベース URL |
| `VITE_USE_DEMO_PDF` | `true` | サンプル PDF を使う |

## ビューア開発の次のステップ

- [ ] 暗号化チャンク → PDF 復号パイプライン
- [ ] オフラインパッケージの Dexie 保存
- [ ] 注釈同期キューのフラッシュ
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
