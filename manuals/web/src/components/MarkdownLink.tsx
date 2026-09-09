import type { Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import { resolveManualHref } from '../catalog'

export const markdownComponents: Components = {
  a({ href, children }) {
    const internal = resolveManualHref(href)
    if (internal?.startsWith('#')) {
      return <a href={internal}>{children}</a>
    }
    if (internal) {
      return (
        <Link to={internal} data-testid="manual-internal-link">
          {children}
        </Link>
      )
    }
    if (href?.startsWith('http://') || href?.startsWith('https://')) {
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    }
    return <span>{children}</span>
  },
}
