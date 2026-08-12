export const HIGHLIGHT_COLORS = [
  { id: 'yellow', value: '#FFEB3B', label: '黄' },
  { id: 'green', value: '#A5D6A7', label: '緑' },
  { id: 'blue', value: '#90CAF9', label: '青' },
  { id: 'pink', value: '#F48FB1', label: 'ピンク' },
  { id: 'orange', value: '#FFCC80', label: '橙' },
] as const

export const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_COLORS[0].value
