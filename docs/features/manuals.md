# マニュアル閲覧アプリ

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [要件](../requirements.md) / [操作マニュアル目次](../manuals/README.md) / [起動](../development/getting-started.md)

## 目的

ロール別の操作手順（`docs/manuals/`）を、ログインなしでブラウザから読む。本文の正本は Markdown ファイルであり、アプリはそれを表示するだけです。

## 状態

| 項目 | 状態 |
|------|------|
| SPA（目次・ロール別ページ） | ✅ `manuals/web` :5210 |
| 認証・API | 対象外。単独起動可 |
| `start-dev.sh` からの起動 | ✅ |
| Markdown 内のマニュアル同士リンク | ✅ アプリ内ルートへ変換 |

## 画面とルート

| パス | 内容 |
|------|------|
| `/` | 目次（`docs/manuals/README.md`） |
| `/learner` | 学習者 |
| `/instructor` | 講師 |
| `/admin` | 管理者 |
| `/developer` | 開発者 |
| `/operator` | 運用者 |

未知のパスは目次へ戻します。

## 起動

```bash
cd manuals/web && npm run dev
# → http://localhost:5210
```

他サービスは不要です。一括起動は `./start-dev.sh`（ポートは `MANUALS_WEB_PORT`、既定 5210）。

## 実装上の約束

- 手順の文言は `docs/manuals/*.md` だけを直す。アプリに本文を複製しない
- Vite は `@manuals` エイリアスでリポジトリの `docs/manuals/` を読む
- Playwright は `manuals/web` の Vite だけを起動する（mock-api / auth なし）

## テスト

- `manuals/web/e2e/manuals.spec.ts`
