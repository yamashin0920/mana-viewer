# PDF ビューア

> 読者: 開発者
> 最終更新: 2026-09-09
> 関連: [注釈](annotations.md) / [学習者マニュアル](../manuals/learner.md) / [プラットフォーム API](../api/platform.md)

## 目的

配布 PDF をページ送り・拡大・検索しながら読み、進捗を保存します。

## 対象ユーザー

当該教材のライセンスを持つユーザー。

## 状態

| 項目 | 状態 |
|------|------|
| PDF 表示（デモ PDF） | ✅ |
| ページ送り（ボタン・←→・PageUp/Down） | ✅ |
| ページ番号入力 | ✅ |
| ズーム | ✅ |
| 見開き | ✅ |
| サムネイル | ✅ |
| テキスト検索 | ✅ |
| 目次・PDF 内リンク | ✅ |
| 閲覧セッション作成 | ✅ |
| 進捗自動保存・最終ページ復帰 | ✅ |
| ウォーターマーク | ✅ |
| 印刷制御 | ✅ | `allowPrint`。印刷ボタンと Ctrl/Cmd+P 抑止 |
| 暗号化チャンク復号 | 🔶 API のみ |
| LTI の `?page=` 起動 | ❌ |

## 画面とルート

`/viewer/:contentId`

- ツールバー: 戻る、ページ、ズーム、表示モード、検索、注釈ツール、テーマ
- サイドバー: 目次 / サムネイル / 注釈
- モバイル: FAB とボトムシート

## 主な操作

- 単ページ: 1 ページずつ。見開き: 2 ページステップ（`spreadPageStep`）
- 印刷: 許可された教材だけツールバーに印刷ボタン。禁止教材はショートカットも無効
- 入力欄がフォーカス中は矢印キーをページ送りに使わない
- 本棚へ戻るリンク
- 検索バーで一致を前後移動、ハイライト

## データと API

1. `POST /licenses/verify`
2. `GET /contents/:id`（TOC・進捗）
3. `GET /contents/:id/policy`
4. `POST /contents/:id/view-sessions`
5. `PUT /contents/:id/progress`

開発時 PDF は `public/sample.pdf`（`VITE_USE_DEMO_PDF`）。

## 権限

verify が `allowed: false` なら閲覧できません。

## テスト

`viewer/e2e/viewer.spec.ts` `progress.spec.ts` `mobile.spec.ts` `dark-mode.spec.ts`

## 未実装・制約

- 実 PDF ストリーミング
- コピーポリシーの UI
- オフラインパッケージ再生
