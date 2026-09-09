# LMS 連携

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [要件](../requirements.md) / [プラットフォーム API](../api/platform.md) / [講師マニュアル](../manuals/instructor.md)

## 目的

コースから教材をマナビューアで開き（LTI / Deep Link 相当）、閲覧を xAPI として残します。

## 対象ユーザー

全ロール。学習者は自分が所属するコースのみ。講師・管理者は組織の全コース。

## 状態

| 項目 | 状態 |
|------|------|
| LMS Web（コース・起動・学習記録） | ✅ `lms/web` :5200 |
| コース一覧 / 詳細 API | ✅ `GET /lms/courses` |
| LTI / Deep Link 起動 | ✅ `POST /lms/launch` → `/viewer/:id?page=&lmsLaunch=1` |
| ビューアの `?page=` | ✅ LMS 起動時は進捗より優先 |
| 名簿同期 | ✅ 講師以上。モック件数を返す |
| xAPI 送信（ビューア） | ✅ LMS 起動時に POST |
| xAPI 一覧（LMS） | ✅ `/activity` |
| 外部 Canvas 等の本番 LTI 1.3 | 🔶 プラットフォーム seed のみ |

## 画面とルート

| アプリ | パス | 説明 |
|--------|------|------|
| lms/web | `/courses` | コース一覧 |
| lms/web | `/courses/:courseId` | 教材起動・メンバー・名簿同期 |
| lms/web | `/activity` | xAPI |
| viewer | `/viewer/:id?page=&lmsLaunch=1&courseId=` | LMS バナー付き閲覧 |

ログインは auth/web。LMS はビューアと同じ SSO です。

## 主な操作

1. LMS でコースを開く
2. 開始ページを指定して「ビューアで開く」
3. `POST /lms/launch` の URL にアクセストークンを付けてビューアへ
4. ビューアが指定ページを開き、xAPI `experienced` を送る
5. 「LMS に戻る」でコースへ戻る

## データと API

コースの実体は seed の `groups`（`externalCourseId`）。教材は配布本棚の公開コンテンツです。

起動 URL のホストは環境変数 `VIEWER_URL`（既定 `http://localhost:5173`）。

## 権限

- 学習者: メンバーのコースのみ
- 講師 / 管理者: コース参照・名簿同期
- 起動そのものは教材ライセンスが必要

## テスト

- `lms/web/e2e/courses.spec.ts`
- `viewer/e2e/print.spec.ts`（LMS クエリ）
- `viewer/e2e/mock-api.spec.ts`（`/lms/courses` `/lms/launch`）

## 未実装・制約

- 実 LMS（Canvas / Moodle）との OIDC/LTI 1.3 署名
- 成績の Grade Passback
