import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === 'light' ? 'ダークモードに切替' : 'ライトモードに切替'}
      title={theme === 'light' ? 'ダークモード' : 'ライトモード'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
