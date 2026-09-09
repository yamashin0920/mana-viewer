# テスト

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [Playwright ルール](../../.cursor/rules/playwright-tests.mdc) / [viewer/e2e/README.md](../../viewer/e2e/README.md)

ユーザー向け機能と API の変更は、同じ変更で Playwright を追加または更新します。テストが無い状態を完了としません。

## 実行

```bash
cd viewer && npm run test:e2e
cd admin/web && npm run test:e2e
cd auth/web && npm run test:e2e
cd lms/web && npm run test:e2e
cd manuals/web && npm run test:e2e
```

viewer の Playwright は mock-api (:3001) と viewer (:5173) を自動起動します。既に起動中なら再利用します（`CI=true` のときは新規起動）。

```bash
cd viewer
npm run test:e2e:ui
npm run test:e2e:report
```

## 配置

| 対象 | ディレクトリ |
|------|----------------|
| Mock API HTTP | `viewer/e2e/mock-api.spec.ts` |
| 本棚 | `viewer/e2e/bookshelf.spec.ts` |
| PDF ビューア | `viewer/e2e/viewer.spec.ts` |
| 注釈 | `viewer/e2e/annotations.spec.ts` |
| 進捗 | `viewer/e2e/progress.spec.ts` |
| ダークモード | `viewer/e2e/dark-mode.spec.ts` |
| モバイル | `viewer/e2e/mobile.spec.ts` |
| ユーザー切替 | `viewer/e2e/user-switch.spec.ts` |
| 管理画面 | `admin/web/e2e/*.spec.ts` |
| LMS | `lms/web/e2e/*.spec.ts` |
| マニュアルアプリ | `manuals/web/e2e/*.spec.ts` |
| 印刷制御 | `viewer/e2e/print.spec.ts` |
| ログイン | `auth/web/e2e/login.spec.ts` |
| 共通 setup | 各パッケージの `e2e/fixtures.ts` |

新しいカテゴリは `viewer/e2e/<feature>.spec.ts` を作って構いません。

## 書き方

- セレクタは `getByTestId` を優先する
- 認証は fixture の `setupAuth` または開発用トークン
- 描画待ちは `await expect(...).toBeVisible()`
- 正常系を最低 1 件。分岐があれば追加
- Mock API のエンドポイント変更は HTTP テストを `mock-api.spec.ts` に足す

## 完了の定義

1. 対象パッケージの `npm run test:e2e` が通る
2. 新 UI に `data-testid` がある
3. `docs/requirements.md` の「テスト」列を更新する

単体テストランナー（Vitest 等）はリポジトリにありません。ロジックの回帰も当面は E2E か Playwright の API テストでカバーします。
