import { Moon, Sun } from 'lucide-react'
import { Button } from './Button'
import { toggleTheme, useTheme } from './theme'

export function ThemeToggle() {
  const theme = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={theme === 'light' ? 'ダークモードに切替' : 'ライトモードに切替'}
      title={theme === 'light' ? 'ダークモード' : 'ライトモード'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
