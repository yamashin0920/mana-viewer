# 運用者マニュアル

> 読者: 起動・監視・障害一次対応をする人
> 最終更新: 2026-09-09
> 関連: [運用](../operations.md) / [トラブルシュート](../troubleshooting.md)

本番インフラの手順ではありません。このリポジトリの開発用 5 プロセスを扱います。

## このマニュアルでできること

- サービスを起動・停止する
- 生きているか確認する
- ログとデータファイルの場所を知る
- よくある起動不良に対処する

## 起動と停止

リポジトリのルートで実行します。

```bash
./start-dev.sh
./start-dev.sh --stop
./start-dev.sh --restart
```

成功時に表示される URL:

| 名前 | URL |
|------|-----|
| ログイン | http://localhost:5180/login |
| 管理画面 | http://localhost:5190 |
| ビューア | http://localhost:5173 |
| Auth API | http://localhost:3002/health |
| Mock API | http://localhost:3001/health |

## ヘルスチェック

```bash
curl -s http://localhost:3002/health
curl -s http://localhost:3001/health
```

Auth API の JSON に `"authMode":"credentials-json"` があることを確認します。これが無いときは 3002 で別プロセスが動いている可能性が高いので `--restart` します。

ログイン画面・管理・ビューアはブラウザで HTTP 200 相当のページが返るか見ます。

## ログ

`.dev/logs/` 配下:

- `auth-api.log`
- `mock-api.log`
- `auth-web.log`
- `admin-web.log`
- `viewer.log`

起動失敗時はスクリプトが末尾 20 行を出します。PID は `.dev/*.pid` です。

## データ

| ファイル | 扱い |
|----------|------|
| `mock-api/data/seed.json` | 教材・ユーザー・ライセンス。管理操作で更新される |
| `auth/api/data/credentials.json` | ログイン ID。平文パスワード |

検証の前にコピーを取ると戻せます。実在個人情報を入れないでください。

## 障害時の順

1. `--restart` する
2. 5 つのヘルス / ページを確認する
3. ログの stack を見る
4. ポート占有なら `--stop` のあと再起動
5. 詳細は [トラブルシュート](../troubleshooting.md)

## できないこと・注意

- プロセスは開発マシン上です。冗長化や自動フェイルオーバーはありません
- 再起動でメモリ上のセッション・一部注釈は消えます
- HTTPS 終端、バックアップジョブ、アラート基盤はこのリポジトリにありません
