# admin

マナビューアの管理画面（React + Vite）。ログイン UI は持たず、`auth/web` にリダイレクトします。

## 起動

リポジトリルートで `./start-dev.sh` を使うのが確実です。管理画面だけなら Auth API / Mock API / auth/web が先に必要です。

```bash
cd admin/web && npm install && npm run dev
# → http://localhost:5190
```

アカウント: `admin` / `admin`

## 画面

| パス | 内容 |
|------|------|
| `/accounts` | ユーザーとログイン資格情報 |
| `/licenses` | ライセンス |
| `/contents` | 教材メタデータ |

## テスト

```bash
cd admin/web && npm run test:e2e
```

## 詳細

- [管理画面機能仕様](../docs/features/admin.md)
- [管理者マニュアル](../docs/manuals/admin.md)
- [管理 API](../docs/api/admin.md)
