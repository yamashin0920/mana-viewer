# 開発スタート

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [アーキテクチャ](../architecture.md) / [テスト](testing.md) / [開発者マニュアル](../manuals/developer.md)

ローカルで全サービスを動かす手順です。

## 前提

- Node.js（各パッケージの Vite 5 / Express が動く版）
- npm
- リポジトリルートで作業する

## 一括起動

```bash
./start-dev.sh
```

初回は各パッケージで `npm install` します。起動後の URL は次のとおりです。

| サービス | URL |
|----------|-----|
| ログイン | http://localhost:5180/login |
| ビューア | http://localhost:5173 |
| 管理画面 | http://localhost:5190 |
| Auth API ヘルス | http://localhost:3002/health |
| Mock API ヘルス | http://localhost:3001/health |

ログは `.dev/logs/` です（`.gitignore` 済み）。

```bash
./start-dev.sh --stop
./start-dev.sh --restart
```

## 開発用アカウント

`auth/api/data/credentials.json` に定義されています。ログイン ID はメールではありません。

| ログイン ID | パスワード | ロール | ユーザー |
|-------------|------------|--------|----------|
| `demo` | `demo` | learner | 田中 太郎 |
| `instructor` | `instructor` | instructor | 鈴木 花子 |
| `admin` | `admin` | org_admin | 管理者 |

管理画面に入れるのは `admin` です。`demo` で管理画面を開くとアクセス拒否になります。

## 個別起動

`start-dev.sh` を使わない場合の順序です。Auth API と Mock API を先に起動します。

```bash
cd auth/api && npm start          # :3002
cd mock-api && npm start          # :3001
cd auth/web && npm run dev        # :5180
cd admin/web && npm run dev       # :5190
cd viewer && npm run dev          # :5173
```

ビューアだけ試す場合でも、未ログインは auth/web へ飛ぶため認証側が必要です。

## 環境変数

| 変数 | 既定 | 用途 |
|------|------|------|
| `AUTH_API_PORT` | 3002 | Auth API |
| `AUTH_WEB_PORT` | 5180 | ログイン UI |
| `ADMIN_WEB_PORT` | 5190 | 管理画面 |
| `MOCK_API_PORT` | 3001 | Mock API |
| `VIEWER_PORT` | 5173 | ビューア |
| `VITE_AUTH_APP_URL` | auth/web の URL | ビューア・管理のリダイレクト先 |
| `VITE_API_BASE_URL` | `/api` | ビューアの API |
| `VITE_USE_DEMO_PDF` | `true` | サンプル PDF を使う |

## 開発用 PDF

Mock API のチャンクはダミーバイナリです。ビューアは `viewer/public/sample.pdf` を表示します。本番 API 接続時は `VITE_USE_DEMO_PDF=false` と復号処理が必要です（未実装）。

## 次に読む

- 画面操作: [マニュアル](../manuals/README.md)
- API: [API 概要](../api/overview.md)
- テスト: [テスト](testing.md)
