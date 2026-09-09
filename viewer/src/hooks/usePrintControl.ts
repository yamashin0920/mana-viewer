import { useEffect } from 'react'
import { toast } from '../components/ui/Toast'

/** DRM の印刷制御。許可されていない教材では Ctrl/Cmd+P と window.print を止める */
export function usePrintControl(allowPrint: boolean | undefined) {
  useEffect(() => {
    if (allowPrint === undefined) return

    const blocked = allowPrint === false
    document.body.classList.toggle('print-disabled', blocked)

    const notifyBlocked = () => {
      toast('この教材は印刷できません', 'error')
    }

    const onBeforePrint = (event: Event) => {
      if (!blocked) return
      event.preventDefault()
      notifyBlocked()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!blocked) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        event.stopPropagation()
        notifyBlocked()
      }
    }

    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.body.classList.remove('print-disabled')
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [allowPrint])
}

export function printIfAllowed(allowPrint: boolean | undefined) {
  if (allowPrint === false) {
    toast('この教材は印刷できません', 'error')
    return
  }
  window.print()
}
