# トラブルシュート

> 読者: 開発者・運用者
> 最終更新: 2026-09-09
> 関連: [運用](operations.md) / [開発スタート](development/getting-started.md)

## ログインできない

1. `curl -s http://localhost:3002/health` を見る
2. `authMode` が `credentials-json` でない、または起動しない → `./start-dev.sh --restart`
3. ID/PW が `demo` / `demo` 形式か確認する（メールアドレスではない）
4. ビューアだけ起動して auth/web が無いと、リダイレクト先が開きません

## ポートが使われている

`start-dev.sh` は `lsof` があればポートを解放します。手動の場合:

```bash
./start-dev.sh --stop
```

残るときは該当ポートのプロセスを確認します。

## 管理画面がアクセス拒否

`demo` は学習者です。管理画面は `admin` / `admin` でログインしてください。

## 本棚が空

- ユーザーにライセンスが割り当てられているか（管理画面のアカウント）
- 教材ステータスが `published` か
- トークンが別ユーザーのものになっていないか（localStorage の `accessToken`）

## PDF が出ない・ダミーに見える

開発時は `sample.pdf` です。チャンク API はダミーバイナリなので、復号未実装のまま本番 PDF は表示できません。

## 注釈が消える

Mock API 再起動でメモリ上の注釈が消えることがあります。seed に含まれないデータは永続しません。

## E2E が落ちる

- 先に別プロセスが 5173 / 3001 / 5210 を占有していないか
- `CI=true` で常に新規起動になる
- seed が E2E で汚れ、アサーションが件数依存だと失敗することがあります

## Playwright がブラウザを入れていない

各パッケージで `npx playwright install` が必要な環境があります。
