# マナビューア (mana-viewer)

B2B 向け PDF 学習プラットフォーム。仕様・マニュアルの正本は [docs/](docs/README.md) です。

## ドキュメント

| 知りたいこと | 文書 |
|--------------|------|
| 文書一覧 | [docs/README.md](docs/README.md) |
| ローカル起動 | [開発スタート](docs/development/getting-started.md) |
| 画面の使い方 | [操作マニュアル](docs/manuals/README.md) |
| 実装状況 | [要件マトリクス](docs/requirements.md) |
| システム構成 | [アーキテクチャ](docs/architecture.md) |

ドキュメントの書き方: [.cursor/skills/documentation/SKILL.md](.cursor/skills/documentation/SKILL.md)  
コントリビューション: [CONTRIBUTING.md](CONTRIBUTING.md)

## 開発ルール

- **機能を実装したら Playwright・docs・マニュアルを同じ変更で更新する** — [.cursor/rules/feature-complete.mdc](.cursor/rules/feature-complete.mdc)

## 起動

```bash
./start-dev.sh
```

| 画面 | URL | 開発用ログイン |
|------|-----|----------------|
| ログイン | http://localhost:5180/login | `demo` / `demo`（学習者） |
| ビューア | http://localhost:5173 | 同上 |
| LMS | http://localhost:5200 | `demo` / `demo` または `instructor` / `instructor` |
| 管理画面 | http://localhost:5190 | `admin` / `admin` |

停止: `./start-dev.sh --stop`

## パッケージ

| ディレクトリ | 説明 |
|--------------|------|
| [`viewer/`](viewer/README.md) | PDF ビューア（React + PDF.js） |
| [`mock-api/`](mock-api/README.md) | 業務 Mock API |
| [`auth/`](auth/README.md) | 認証 API + ログイン画面 |
| [`admin/`](admin/README.md) | 管理画面 |
| [`lms/`](lms/README.md) | LMS（コースからビューア起動） |

## テスト

```bash
cd viewer && npm run test:e2e
cd admin/web && npm run test:e2e
cd auth/web && npm run test:e2e
cd lms/web && npm run test:e2e
```
