# マナLMS

マナビューアと連携する学習管理システム（開発用）。ログインは `auth/web` に委譲します。

## 起動

リポジトリルートで `./start-dev.sh` を使うのが確実です。

```bash
cd lms/web && npm install && npm run dev
# → http://localhost:5200
```

アカウント例: `demo` / `demo`（学習者）、`instructor` / `instructor`

## 画面

| パス | 内容 |
|------|------|
| `/courses` | コース一覧 |
| `/courses/:id` | 教材の LTI 起動・名簿 |
| `/activity` | xAPI 学習記録 |

## テスト

```bash
cd lms/web && npm run test:e2e
```

## 詳細

- [LMS 機能仕様](../docs/features/drm-offline-lms.md)
- [講師マニュアル](../docs/manuals/instructor.md)
- [プラットフォーム API](../docs/api/platform.md)
