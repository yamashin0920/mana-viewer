# ビューアの画面枠

ツールバーの操作は **部品の集合** と **配置表** に分けて持つ。見た目の並べ替えは配置表だけを触る。

## 部品

`ViewerToolbar` の `parts` が ID → React ノードの辞書。ボタン自体の実装はここに置く。

## 配置

`viewerToolbarPlacement.ts` がどの領域にどの ID を置くかを決める。

| 領域 | 意味 |
|---|---|
| `leading` | 左（戻る・サイドバー・タイトル） |
| `trailing` | 右に常時出す操作（検索・ページ送り・テーマなど） |
| `expandable` | 狭い画面では「ツール」を押して展開。`lg` 以上は常時表示 |

`ChromeBar` が leading / trailing を左右に分け、`ExpandablePanel` が expandable をトレイにしまう。

## 部品を足す手順

1. `ViewerToolbarPartId` に ID を足す
2. `ViewerToolbar` の `parts` にノードを登録する
3. 配置表の 3 配列のどれかに ID を置く
