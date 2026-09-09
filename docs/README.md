# マナビューア ドキュメント

> 読者: 全員
> 最終更新: 2026-09-09
> 関連: [要件](requirements.md) / [用語集](glossary.md) / [マニュアル目次](manuals/README.md)

B2B 向け PDF 学習プラットフォーム **マナビューア (mana-viewer)** の文書一覧です。書き方は [.cursor/skills/documentation/SKILL.md](../.cursor/skills/documentation/SKILL.md) に従います。

## まず読む

| 目的 | 文書 |
|------|------|
| リポジトリを動かす | [開発スタート](development/getting-started.md) |
| 画面の使い方 | [操作マニュアル](manuals/README.md)（アプリ: http://localhost:5210） |
| 何が実装済みか | [要件と実装状況](requirements.md) |
| システム全体像 | [アーキテクチャ](architecture.md) |

## システム開発

| 文書 | 内容 |
|------|------|
| [アーキテクチャ](architecture.md) | プロセス構成、ポート、認証と認可の境界 |
| [ドメインモデル](domain-model.md) | 組織・ユーザー・教材・ライセンス・注釈 |
| [用語集](glossary.md) | 画面・API で使う言葉 |
| [要件と実装状況](requirements.md) | 機能マトリクスとテスト対応 |

### 開発プロセス

| 文書 | 内容 |
|------|------|
| [開発スタート](development/getting-started.md) | 前提、起動、開発用アカウント |
| [ディレクトリ構成](development/directory-structure.md) | リポジトリの地図 |
| [コーディング規約](development/coding-conventions.md) | 構成、命名、状態管理 |
| [テスト](development/testing.md) | Playwright、配置、完了条件 |
| [Git 運用](development/git-workflow.md) | ブランチ、コミット、PR |

### API

| 文書 | 内容 |
|------|------|
| [API 概要](api/overview.md) | サービス分割、認証ヘッダ、共通規約 |
| [認証 API](api/auth.md) | auth/api（ログイン・資格情報管理） |
| [プラットフォーム API](api/platform.md) | mock-api（本棚・閲覧・注釈など） |
| [管理 API](api/admin.md) | ユーザー・教材・ライセンス管理 |
| [エラー](api/errors.md) | ステータスと error コード |

### 機能仕様

| 文書 | 内容 |
|------|------|
| [認証・SSO](features/auth.md) | ログイン、リダイレクト、ログアウト |
| [本棚](features/bookshelf.md) | 教材一覧、検索、進捗 |
| [PDF ビューア](features/viewer.md) | 表示、検索、目次、セッション |
| [注釈](features/annotations.md) | マーカー、描画、共有、エクスポート |
| [ライセンス](features/licenses.md) | 席数、割当、閲覧前検証 |
| [管理画面](features/admin.md) | アカウント、教材、ライセンス UI |
| [LMS 連携](features/lms.md) | コース、LTI 起動、xAPI |
| [マニュアル閲覧](features/manuals.md) | 操作マニュアル SPA（認証なし） |
| [DRM・オフライン](features/drm-offline-lms.md) | 印刷、端末、オフライン |

### 横断

| 文書 | 内容 |
|------|------|
| [セキュリティ](security.md) | 認証、認可、DRM、開発時の注意 |
| [運用](operations.md) | 起動停止、ログ、データ永続化 |
| [トラブルシュート](troubleshooting.md) | よくある起動・ログイン障害 |

## マニュアル

操作手順はロール別に [docs/manuals/](manuals/README.md) にあります。ブラウザではマニュアルアプリ（http://localhost:5210）でも読めます。

## パッケージ README（起動の要約）

詳細仕様は本ディレクトリを正とします。各 README は起動とリンクだけです。

- [ルート README](../README.md)
- [viewer/README.md](../viewer/README.md)
- [mock-api/README.md](../mock-api/README.md)
- [auth/README.md](../auth/README.md)
- [admin/README.md](../admin/README.md)
- [lms/README.md](../lms/README.md)
- [manuals/README.md](../manuals/README.md)
- [viewer/e2e/README.md](../viewer/e2e/README.md)
