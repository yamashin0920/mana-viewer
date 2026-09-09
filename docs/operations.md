# 運用

> 読者: 運用者・開発者
> 最終更新: 2026-09-09
> 関連: [開発スタート](development/getting-started.md) / [トラブルシュート](troubleshooting.md) / [運用マニュアル](manuals/operator.md)

このリポジトリの「運用」はローカル／検証用プロセスの起動・停止・データファイルです。本番クラスタの手順はありません。

## プロセス

`./start-dev.sh` が PID を `.dev/*.pid` に書き、ログを `.dev/logs/` に出します。

| 操作 | コマンド |
|------|----------|
| 起動 | `./start-dev.sh` |
| 停止 | `./start-dev.sh --stop` |
| 再起動 | `./start-dev.sh --restart` |

ヘルス:

```bash
curl -s http://localhost:3002/health
curl -s http://localhost:3001/health
```

Auth API は `authMode` が `"credentials-json"` であること。別プロセスが 3002 を占有しているとログインだけ古い実装になることがあります。

## データバックアップ（開発）

| ファイル | 内容 |
|----------|------|
| `mock-api/data/seed.json` | 組織、ユーザー、教材、ライセンス、進捗など |
| `auth/api/data/credentials.json` | ログイン ID / パスワード / トークン |

管理画面の更新はこれらの JSON を書き換えます。検証前にコピーを取ると復元できます。Git にコミットしてよいのは架空データだけです。

xAPI の記録はメモリ上です。再起動で消えます。

## 監視の目安

- ポート 3001 / 3002 / 5173 / 5180 / 5190 / 5200 / 5210 が listen しているか
- ログに Express のスタックトレースが出ていないか
- ディスクの seed が壊れて JSON パースできないと Mock API が起きません

## 本番移行で別途必要なもの

リポジトリ外の作業です。

- HTTPS 終端、シークレット管理
- 実 PDF ストレージと暗号化
- データベース
- バックアップと監査ログ
- LMS / IdP
