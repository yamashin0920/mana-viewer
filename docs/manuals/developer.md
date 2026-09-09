# 開発者マニュアル

> 読者: 開発メンバー
> 最終更新: 2026-09-09
> 関連: [開発スタート](../development/getting-started.md) / [テスト](../development/testing.md) / [ドキュメント目次](../README.md)

設計の詳細は `docs/` の開発文書にあります。ここでは日常の作業手順だけを書きます。

## このマニュアルでできること

- 全サービスを起動して画面を確認する
- パッケージ単位で開発する
- E2E を回す
- ドキュメントをルールどおり更新する

## 初回

```bash
git clone <repo>
cd mana-viewer   # リポジトリルート
./start-dev.sh
```

ブラウザ:

- ログイン http://localhost:5180/login
- ビューア http://localhost:5173 （`demo` / `demo`）
- 管理 http://localhost:5190 （`admin` / `admin`）

## 日常

```bash
./start-dev.sh          # 起動または既存の再起動判定
./start-dev.sh --restart
./start-dev.sh --stop
```

ログ: `.dev/logs/`（auth-api, mock-api, auth-web, admin-web, viewer）。

コードを触る場所:

| 変更したいこと | ディレクトリ |
|----------------|--------------|
| 本棚・PDF・注釈 | `viewer/` |
| 管理 UI | `admin/web/` |
| ログイン画面 | `auth/web/` |
| ログイン API・資格情報 | `auth/api/` |
| 業務 API・seed | `mock-api/` |
| 文書 | `docs/` と `.cursor/skills/` |

ログイン画面をビューアに作らないでください。ルールは [コーディング規約](../development/coding-conventions.md) です。

## テスト

機能を足したら Playwright を同じ変更で足します。

```bash
cd viewer && npm run test:e2e
cd admin/web && npm run test:e2e
cd auth/web && npm run test:e2e
```

ルール: `.cursor/rules/playwright-tests.mdc`

## ドキュメント

[.cursor/skills/documentation/SKILL.md](../../.cursor/skills/documentation/SKILL.md) に従います。画面手順は [.cursor/skills/manuals/SKILL.md](../../.cursor/skills/manuals/SKILL.md) です。

最低限:

1. `docs/requirements.md` の行
2. 該当 `docs/features/` または `docs/api/`
3. UI が変わるなら `docs/manuals/`

## 開発用トークン（API 直接）

```
Authorization: Bearer mock-token-learner
```

一覧: `GET http://localhost:3001/` の案内、または Auth API `GET /auth/tokens`。

## できないこと・注意

- seed を壊した PR を出さない（E2E の書き込みに注意）
- `VITE_USE_DEMO_PDF` を本番相当と書かない
- 新機能の「完了」はテスト通過を含む
