# @mana/ui

viewer / admin / auth の 3 アプリで共有する UI プリミティブとデザイントークンです。

以前は各アプリが `Button` と `ThemeToggle` を個別に実装し、Tailwind のトークンを
3 つの `index.css` に複製していました。すでに実装が乖離しており（管理画面だけ
ダークモードが永続化されない、viewer だけアニメーションとスケルトンがある、など）、
アクセシビリティの修正を 3 箇所に入れる必要がある状態だったため 1 箇所に集約しています。

## 中身

| ファイル | 内容 |
|---|---|
| `tokens.css` | ブランドカラー、影、フォント、アニメーション、`.skeleton`、`.custom-scrollbar` |
| `src/Button.tsx` | 5 バリアント × 3 サイズ。全てにフォーカスリングあり |
| `src/theme.ts` | ダークモードの状態管理（localStorage 永続化 + OS 設定の反映） |
| `src/ThemeToggle.tsx` | テーマ切替ボタン |
| `src/Modal.tsx` | `role="dialog"` / フォーカストラップ / Escape / 背後スクロール抑止 |
| `src/ConfirmDialog.tsx` | 破壊的操作の確認ダイアログ |
| `src/EmptyState.tsx` | 0 件時の表示 |
| `src/useFocusTrap.ts` | フォーカスの閉じ込めと復帰 |

## 使い方

ビルド成果物ではなくソースを直接参照します。各アプリの Vite が変換するため、
このパッケージ単体のビルド手順はありません。

```ts
// vite.config.ts
resolve: {
  alias: { '@mana/ui': path.resolve(__dirname, '../packages/ui/src') },
}
```

```jsonc
// tsconfig.app.json
"paths": { "@mana/ui": ["../packages/ui/src"], "@mana/ui/*": ["../packages/ui/*"] }
```

```css
/* src/index.css */
@import "tailwindcss";
@source "../../packages/ui/src";   /* クラス名を Tailwind に拾わせる */
@import "../../packages/ui/tokens.css";
```

```tsx
import { Button, ThemeToggle } from '@mana/ui'
```

## 注意

- React と lucide-react は各アプリ側の依存を使います（このパッケージに package.json はありません）
- Tailwind v4 はプロジェクト外のファイルを自動では走査しないため、`@source` の指定が必須です
