export const PEN_COLORS = [
  { id: 'red', value: '#E53935', label: '赤' },
  { id: 'blue', value: '#1E88E5', label: '青' },
  { id: 'green', value: '#43A047', label: '緑' },
  { id: 'black', value: '#212121', label: '黒' },
  { id: 'orange', value: '#FB8C00', label: '橙' },
] as const

export const DEFAULT_PEN_COLOR = PEN_COLORS[0].value
