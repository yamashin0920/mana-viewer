# `@mana/contracts`

ドメイン型・ロール・管理権限の単一ソースです。

## 使い方

### フロントエンド（TypeScript）

```ts
import { can, ROLE_LABELS, type User, type AdminPermission } from '@mana/contracts'
```

### Node（mock-api / auth-api）

```js
const { ADMIN_ROLES, isAdminRole, isOrgAdminRole, can } = require('@mana/contracts/node')
```

フロントの `can()` とバックエンドのミドルウェアは、同じ権限表を参照します。
