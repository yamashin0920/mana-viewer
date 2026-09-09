# アーキテクチャ

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [開発スタート](development/getting-started.md) / [API 概要](api/overview.md) / [認証機能](features/auth.md)

開発時点のプロセス構成と責務分割です。本番のドメイン分割は同じ境界を想定しますが、このリポジトリにデプロイ定義（Docker Compose 以外の本番 IaC）はありません。

## 全体像

開発環境は 6 プロセスです。一括起動はリポジトリルートの `./start-dev.sh` です。

```
ブラウザ
  ├─ auth/web     :5180  唯一のログイン UI + SSO セッション
  ├─ viewer       :5173  本棚・PDF ビューア（認可のみ）
  ├─ admin/web    :5190  管理画面（認可のみ）
  └─ lms/web      :5200  LMS（コースからビューア起動）
        │
        ├─ /api/auth  → auth/api   :3002
        └─ /api または /api/mock → mock-api :3001
```

| パッケージ | ポート | 技術 | 責務 |
|------------|--------|------|------|
| `auth/web` | 5180 | React + Vite | ログイン、ログアウト、SSO セッション |
| `auth/api` | 3002 | Express | ID/PW 検証、トークン発行、資格情報 CRUD |
| `viewer` | 5173 | React + Vite + PDF.js | 本棚、PDF 表示、注釈 |
| `admin/web` | 5190 | React + Vite | アカウント・教材・ライセンス管理 |
| `lms/web` | 5200 | React + Vite | コース、LTI 起動、学習記録 |
| `mock-api` | 3001 | Express | 学習・管理・LMS の業務 API |

ビューアと管理画面と LMS にログインフォームはありません。未ログインは `auth/web` へリダイレクトします。

## 認証と認可

| レイヤ | 担当 | 内容 |
|--------|------|------|
| 認証 | `auth/api` + `auth/web` | 資格情報の照合、トークン、共通セッション |
| 認可（画面） | viewer / admin の `AuthGuard` | トークン有無。管理画面は `org_admin` / `content_admin` のみ |
| 認可（API） | mock-api / auth-api のミドルウェア | Bearer、ロール、組織一致、ライセンス |

SSO の流れは [機能仕様: 認証](features/auth.md) を参照してください。

## フロントの通信

- **viewer**: Vite proxy で `/api` → mock-api。認証アプリ URL は `VITE_AUTH_APP_URL`
- **admin/web**: `/api/auth` → auth-api、`/api/mock` → mock-api
- **lms/web**: `/api/mock` → mock-api、`VITE_AUTH_APP_URL` でログインへ
- **auth/web**: 認証 API へログインし、`accessToken` をリダイレクト先へ渡す

トークンは各 SPA の `localStorage`（`accessToken`）に保存します。auth/web 側にもセッションがあります。

## データ

| ストア | 場所 | 寿命 |
|--------|------|------|
| 教材・ユーザー・ライセンス・注釈など | `mock-api/data/seed.json` | 管理 API の更新はファイルへ保存。プロセス再起動で読み直し |
| ログイン資格情報 | `auth/api/data/credentials.json` | 管理画面からの CRUD でファイル更新 |
| オフラインキュー | ブラウザ Dexie（`mana-viewer-offline`） | 進捗キューは API 失敗時。フラッシュ（再同期）は未実装 |
| テーマ | `localStorage` | ダークモード |

Mock API の閲覧セッション・注釈の一部はメモリ上です。サーバー再起動で消えるデータがある点に注意してください。

## ビューア内部

```
pages/
  BookshelfPage   教材カード、検索、最近読んだもの
  ViewerPage      PDF + ツールバー + サイドバー
api/              TanStack Query 向け fetch
store/            Zustand（認証・テーマ）
db/offline.ts     Dexie
components/viewer PDF.js ラッパ、注釈レイヤ
```

開発時は `VITE_USE_DEMO_PDF=true` のため、暗号化チャンクではなく `public/sample.pdf` を描画します。

## 今後の境界（未実装）

本番相当にするときに差し替える想定です。現コードにはありません。

- 暗号化チャンクの復号パイプライン
- Service Worker による完全オフライン閲覧
- マルチテナントの物理分離
- LTI 起動パラメータ（`/viewer/:id?page=`）の正式対応 — **実装済み**
