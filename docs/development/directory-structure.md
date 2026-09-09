# ディレクトリ構成

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [アーキテクチャ](../architecture.md) / [コーディング規約](coding-conventions.md)

リポジトリルートの地図です。

```
.
├── start-dev.sh              5 プロセス一括起動
├── README.md                 入口
├── docs/                     仕様・マニュアル（正本）
├── .cursor/
│   ├── rules/                エージェント向けルール（Playwright、ドキュメント）
│   └── skills/               ドキュメント / マニュアル作成スキル
├── viewer/                   学習者向け SPA（:5173）
│   ├── src/pages/            本棚・ビューア
│   ├── src/components/       UI / PDF / 注釈
│   ├── src/api/              Mock API クライアント
│   ├── e2e/                  Playwright
│   └── public/sample.pdf     開発用 PDF
├── admin/web/                管理 SPA（:5190）
├── auth/
│   ├── api/                  認証 API（:3002）
│   │   └── data/credentials.json
│   └── web/                  ログイン SPA（:5180）
└── mock-api/                 業務 API（:3001）
    ├── src/routes/
    └── data/seed.json
```

ルートに `package.json` はありません。各パッケージが独立しています。
