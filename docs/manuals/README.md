# 操作マニュアル

> 読者: 全員
> 最終更新: 2026-09-09
> 関連: [ドキュメント目次](../README.md) / [用語集](../glossary.md)

ロールに合うファイルだけ読んでください。ブラウザで開く場合は **マニュアルアプリ** http://localhost:5210 （ログイン不要。`cd manuals/web && npm run dev` でも単体起動できます）。

| あなた | マニュアル | アプリ内パス | 使う画面 |
|--------|------------|--------------|----------|
| 生徒・受講者 | [学習者](learner.md) | `/learner` | ログイン + ビューア |
| 先生 | [講師](instructor.md) | `/instructor` | ビューア + LMS |
| 学校・組織の管理者 | [管理者](admin.md) | `/admin` | ログイン + 管理画面 |
| アプリを実装する人 | [開発者](developer.md) | `/developer` | 全サービス + テスト |
| 起動と障害を見る人 | [運用者](operator.md) | `/operator` | スクリプト・ヘルス・ログ |

書き方のルール: [.cursor/skills/manuals/SKILL.md](../../.cursor/skills/manuals/SKILL.md)

## 共通の入口

1. **マニュアル**: http://localhost:5210 （ログイン不要）
2. ログイン画面: http://localhost:5180/login
3. ビューア: http://localhost:5173
4. 管理画面: http://localhost:5190 （管理者のみ）
5. LMS: http://localhost:5200

開発用 ID は [学習者マニュアルのログイン](learner.md#ログイン) を参照してください。
