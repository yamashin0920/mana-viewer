# マナビューア (mana-viewer)

B2B 向け PDF 学習プラットフォーム。

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [docs/features.md](docs/features.md) | **現存する機能** — 実装済み機能の一覧 |
| [docs/improvements.md](docs/improvements.md) | **ほしい修正** — 未実装・要改善の項目と優先度 |
| [docs/requirements.md](docs/requirements.md) | 要件一覧と実装マトリクス |

## 開発ルール

- **機能を実装したら Playwright テストを追加する** — [.cursor/rules/playwright-tests.mdc](.cursor/rules/playwright-tests.mdc)

## 構成

npm workspaces による単一リポジトリです。依存関係はリポジトリルートで一度インストールします。

| パッケージ | ポート | 役割 |
|---|---|---|
| [`auth/api`](auth/README.md) | 3002 | 認証 API |
| [`auth/web`](auth/README.md) | 5180 | 共通ログイン画面 |
| [`viewer`](viewer/README.md) | 5173 | 学習者向け PDF ビューア |
| [`admin/web`](admin/web) | 5190 | 管理画面 |
| [`mock-api`](mock-api/README.md) | 3001 | 業務 API のモック |
| [`packages/ui`](packages/ui/README.md) | — | 共有 UI プリミティブとデザイントークン |
| [`packages/contracts`](packages/contracts/README.md) | — | ドメイン型・ロール・管理権限 |
| [`packages/auth-client`](packages/auth-client/README.md) | — | SSO・トークン・ApiError・AuthGuard |
| [`packages/dev-data`](packages/dev-data/README.md) | — | seed / credentials の共有アクセス層 |

## 起動

```bash
npm install     # ルートで一度だけ（全ワークスペース分）
./start-dev.sh  # 全サービスを起動
```

個別に起動する場合:

```bash
cd mock-api && npm start     # → http://localhost:3001
cd viewer && npm run dev     # → http://localhost:5173
```

## テスト

```bash
npm run test:e2e                  # 全アプリ
npm run test:e2e -w mana-viewer   # ビューアのみ
```

各アプリの Playwright 設定が必要なサーバーを自動起動します。
