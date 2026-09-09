# Git 運用

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [コーディング規約](coding-conventions.md) / [テスト](testing.md)

## ブランチ

既定のベースは `main` です。機能ごとにブランチを切り、直接 `main` へ作業しないでください。

コミットメッセージの既存傾向:

```
feat(viewer): ...
fix(viewer): ...
```

スコープ例: `viewer` `admin` `auth` `mock-api` `docs`。

## 1 つの変更に含めるもの

- 実装
- Playwright（ユーザー向け挙動・API 変更時）
- 該当する `docs/`（[ドキュメントスキル](../../.cursor/skills/documentation/SKILL.md)）

ドキュメントだけの変更も同じルールで PR にします。

## レビューで見る点

- 認証をビューアや管理画面に再導入していないか
- ライセンス・組織フィルタを外していないか
- 未実装を要件表で ✅ にしていないか
- シークレットをコミットしていないか

## データファイル

`mock-api/data/seed.json` と `auth/api/data/credentials.json` は開発データです。E2E が書き込む場合があるため、意図しない差分を PR に混ぜないでください。
