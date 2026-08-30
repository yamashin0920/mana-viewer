# Playwright

```bash
cd viewer
npm run test:e2e          # 全テスト実行
npm run test:e2e:ui       # UI モード
npm run test:e2e:report   # レポート表示
```

## 前提

Playwright が auth-api (3002)・mock-api (3001)・auth/web (5180)・viewer (5173) を自動起動します。
mock-api は `AUTH_API_URL` 経由で auth-api にトークン検証を委譲します。
既に起動中の場合は再利用します（`CI=true` 時は常に新規起動）。

## テスト構成

| ファイル | 内容 |
|----------|------|
| `e2e/mock-api.spec.ts` | Mock API の HTTP テスト |
| `e2e/bookshelf.spec.ts` | 本棚（検索・フィルタ・最近読んだもの） |
| `e2e/viewer.spec.ts` | PDF ビューア（ページ送り・ズーム・見開き） |
| `e2e/annotations.spec.ts` | 注釈（一覧・編集・削除・ハイライト） |
| `e2e/a11y.spec.ts` | ダイアログ・トースト・スキップリンクのアクセシビリティ |
| `e2e/access.spec.ts` | ライセンス拒否・教材なし・透かし |
| `e2e/drm.spec.ts` | チャンク配信・DRM のコピー/印刷 |
| `e2e/dark-mode.spec.ts` | ダークモード切替 |
| `e2e/mobile.spec.ts` | モバイル UI（FAB・ズーム・色・ピンチ） |
| `e2e/progress.spec.ts` | 読書進捗の保存と復元 |
| `e2e/user-switch.spec.ts` | 開発用ユーザー切替 |

## プロジェクト

- **chromium** — デスクトップ Chrome（mobile.spec 以外）
- **mobile-chrome** — Pixel 5 相当（mobile.spec のみ）
