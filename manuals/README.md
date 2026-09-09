# マナマニュアル

操作マニュアルをブラウザで読む専用アプリです。ログインは不要です。本文の正本は [`docs/manuals/`](../docs/manuals/) です。

## 単体起動

他サービス（認証・API・ビューア）は不要です。

```bash
cd manuals/web
npm install
npm run dev
# → http://localhost:5210
```

## 一括起動

リポジトリルート:

```bash
./start-dev.sh
```

マニュアル: http://localhost:5210

## 画面

| パス | 内容 |
|------|------|
| `/` | 目次 |
| `/learner` | 学習者 |
| `/instructor` | 講師 |
| `/admin` | 管理者 |
| `/developer` | 開発者 |
| `/operator` | 運用者 |

## テスト

```bash
cd manuals/web && npm run test:e2e
```
