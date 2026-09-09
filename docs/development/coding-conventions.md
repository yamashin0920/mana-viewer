# コーディング規約

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [テスト](testing.md) / [Git 運用](git-workflow.md) / [Playwright ルール](../../.cursor/rules/playwright-tests.mdc)

このリポジトリの既存コードに合わせます。新しいスタイルだけを持ち込まないでください。

## パッケージ境界

| 置いてよいもの | 置いてはいけないもの |
|----------------|----------------------|
| viewer の画面・PDF・注釈 UI | viewer 内のログインフォーム |
| admin の CRUD UI | admin 内のログインフォーム |
| auth の認証だけ | auth に本棚や教材 CRUD |
| lms のコースと起動 | lms 内のログインフォーム |
| mock-api の業務 API | 本番向けの実 PDF 暗号化実装を「完成」としてコミット |

共通型はパッケージ間で npm workspace 化していません。`viewer/src/types` と `admin/web/src/types` は意図的に近い定義です。契約を変えるときは両方と `docs/api/` を更新します。

## フロント（viewer / admin / auth web）

- TypeScript + React 関数コンポーネント
- ルーティングは React Router
- サーバー状態: viewer は TanStack Query、admin はページ内 fetch + `useState`
- クライアント状態: Zustand（認証、テーマ）
- スタイル: Tailwind。新規の別 CSS フレームワークは足さない
- 操作対象には `data-testid` を付ける（既存: `bookshelf-page`, `viewer-toolbar` など）

パスの目安:

```
src/pages/          ルートに紐づく画面
src/components/     画面部品。ui/ は汎用
src/api/            fetch ラッパ
src/store/          Zustand
src/hooks/          PDF やキーボード
src/utils/          純関数
src/types/          API とドメイン型
```

## バックエンド（auth/api, mock-api）

- CommonJS の Express
- ルートファイルはリソースごと（`routes/contents.js` など）
- 認証は `middleware/auth.js`、管理は `middleware/admin.js`
- エラー JSON は `{ error, message }`（[エラー](../api/errors.md)）
- バリデーション失敗は 400、権限は 403、欠如は 404、席不足は 409

## 命名

- ファイル: コンポーネントは PascalCase、それ以外は camelCase
- API パス: 複数形リソース、ケバブケースなし（`view-sessions` のような複数語はハイフン）
- ロール・注釈タイプなどの列挙は既存のユニオンを再利用する

## セキュリティ（開発時）

- 開発用パスワード `demo` などはドキュメントに書いてよい
- 新しいシークレットをリポジトリに置かない
- CORS は開発用に全許可です。本番想定の変更は [セキュリティ](../security.md) に書く

## ドキュメント

機能・API・画面を変えたら [.cursor/skills/documentation/SKILL.md](../../.cursor/skills/documentation/SKILL.md) の更新セットに従います。
