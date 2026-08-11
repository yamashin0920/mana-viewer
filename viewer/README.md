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

- 本棚画面 — ライセンス付き教材一覧、読書進捗バー
- PDF ビューア — ページ送り、ズーム、目次ジャンプ
- 注釈 — テキスト選択でハイライト、ブックマーク追加、一覧・削除
- 進捗保存 — API へ自動保存（失敗時 Dexie キュー）
- DRM 表示 — ウォーターマークオーバーレイ
- 開発用ユーザー切替 — ヘッダーのセレクトボックス

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
- [ ] 印刷・コピー制御（policy.drm 反映）
