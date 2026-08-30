/**
 * ビューアツールバーの部品 ID と配置。
 *
 * 新しい操作を足す手順:
 * 1. 下の `ViewerToolbarPartId` に ID を足す
 * 2. ViewerToolbar の `parts` に部品を登録する
 * 3. この配置表の配列に ID を置く（先頭 / 常時 / 展開トレイ）
 */
export type ViewerToolbarPartId =
  | 'back'
  | 'sidebar'
  | 'title'
  | 'search'
  | 'pager'
  | 'theme'
  | 'note'
  | 'bookmark'
  | 'annotations'
  | 'visibility'
  | 'viewMode'
  | 'zoom'

export const viewerToolbarPlacement = {
  leading: ['back', 'sidebar', 'title'] as const satisfies readonly ViewerToolbarPartId[],
  trailing: ['search', 'pager', 'theme', 'note', 'bookmark'] as const satisfies readonly ViewerToolbarPartId[],
  expandable: ['annotations', 'visibility', 'viewMode', 'zoom'] as const satisfies readonly ViewerToolbarPartId[],
}
