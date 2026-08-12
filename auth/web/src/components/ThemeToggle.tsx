import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './Button'

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setDark((value) => {
          const next = !value
          localStorage.setItem('theme', next ? 'dark' : 'light')
          return next
        })
      }}
      aria-label="テーマ切替"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
