# 認証・SSO

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [認証 API](../api/auth.md) / [アーキテクチャ](../architecture.md) / [学習者マニュアル](../manuals/learner.md)

## 目的

1 つのログイン画面でビューアと管理画面に入れるようにします。

## 対象ユーザー

全ロール。認可の差はログイン後です。

## 状態

| 項目 | 状態 |
|------|------|
| ID/PW ログイン | ✅ |
| 未ログイン時のリダイレクト | ✅ |
| SSO（auth/web セッション） | ✅ |
| ログアウトで共通セッション破棄 | ✅ |
| 管理画面のロールゲート | ✅ |
| LTI 起動 | ✅ | LMS `POST /lms/launch` とビューア `?page=` |

## 画面とルート

| アプリ | パス | 説明 |
|--------|------|------|
| ログイン画面 | `/login` | ログイン。有効セッションなら即リダイレクト |
| auth/web | `/logout` | セッション破棄 → ログインへ |
| viewer | すべて | `AuthGuard`。トークンなしなら auth へ |
| admin | すべて | `AuthGuard` + `canAccessAdmin` |
| lms/web | すべて | `AuthGuard`。全ロール可 |

## 主な操作

1. ビューア (5173)・管理 (5190)・LMS (5200) を開く
2. 未ログインなら `http://localhost:5180/login?redirect=...`
3. auth/web にセッションがあれば ID/PW を出さず `?accessToken=` 付きで戻る
4. なければログイン → セッション保存 → 元アプリへ
5. 各アプリはトークンを `localStorage` に保存し API へ載せる
6. ログアウトは auth/web `/logout`

## データと API

- `POST /auth/login` `{ userId, password }`
- `GET /auth/me`
- 資格情報: `credentials.json`
- ユーザー属性: mock-api seed

## 権限

ログイン成功後:

- viewer: 全ロール
- lms: 全ロール（学習者は所属コースのみ）
- admin: `org_admin` `content_admin` 以外はアクセス拒否ページ

## テスト

- `auth/web/e2e/login.spec.ts`
- `admin/web/e2e/login.spec.ts`
- viewer の AuthGuard（各 E2E の setup）

## 未実装・制約

- パスワードリセット、MFA、SSO IdP（組織設定の `ssoEnabled` は seed のみ）
- トークン失効リスト
