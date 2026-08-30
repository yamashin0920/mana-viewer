# `@mana/dev-data`

`auth-api` と `mock-api` が互いのディレクトリを直接参照しないための、開発用データアクセス層です。

## 既定パス

| データ | 既定パス | 上書き環境変数 |
|---|---|---|
| seed（ユーザー・教材など） | `mock-api/data/seed.json` | `MANA_SEED_PATH` |
| credentials（ログイン資格情報） | `auth/api/data/credentials.json` | `MANA_CREDENTIALS_PATH` |

```js
const { loadSeed, saveSeed, loadCredentials, saveCredentials, loadUsers, loadTokenMap } =
  require('@mana/dev-data')
```
