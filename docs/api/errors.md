# API エラー

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [API 概要](overview.md)

失敗レスポンスの形です。

```json
{
  "error": "forbidden",
  "message": "閲覧ライセンスがありません"
}
```

開発時の認証エラーは `hint` にモックトークンの案内が付くことがあります。

## HTTP ステータス

| 状態 | 用途 |
|------|------|
| 400 | バリデーション、不正なページ番号、未登録端末など |
| 401 | 未認証、無効トークン、セッショントークン欠如 |
| 403 | ロール不足、他組織、ライセンスなし、配布棚の変更、端末上限 |
| 404 | リソースなし |
| 409 | 席不足、ログイン ID / ユーザーの重複 |
| 410 | 注釈共有リンクの期限切れ |
| 500 | 資格情報に紐づくユーザーが seed に無い など |

## error コード

| error | 典型 |
|-------|------|
| `unauthorized` | Bearer なし |
| `invalid_token` | 未知のトークン |
| `invalid_credentials` | ログイン失敗 |
| `invalid_refresh_token` | リフレッシュ不正 |
| `user_not_found` | トークンまたは紐付け先のユーザー欠落 |
| `forbidden` | 権限・ライセンス・組織 |
| `not_found` | 汎用 404 |
| `validation_error` | 必須欠落、不正ロール、席数 |
| `invalid_type` | 注釈 type |
| `invalid_page` | チャンクのページ範囲 |
| `session_required` | `X-Session-Token` なし |
| `seats_exhausted` | ライセンス席の上限 |
| `duplicate` | 資格情報の重複 |
| `cannot_delete_self` | 自分のユーザー削除 |
| `cannot_delete` | デフォルト admin 資格情報 |
| `device_not_registered` | オフライン発行前に端末未登録 |
| `device_limit` | 端末台数上限 |
| `offline_not_allowed` | 教材ポリシーがオフライン不可 |
| `no_annotations` | 共有対象の注釈が空 |
| `expired` | 共有リンク期限切れ |

フロントは `message` をトーストやフォームエラーに出します。`error` で分岐する場合は上表の値だけを使ってください。
