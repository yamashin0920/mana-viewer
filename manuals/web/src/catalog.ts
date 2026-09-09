import index from '@manuals/README.md?raw'
import learner from '@manuals/learner.md?raw'
import instructor from '@manuals/instructor.md?raw'
import admin from '@manuals/admin.md?raw'
import developer from '@manuals/developer.md?raw'
import operator from '@manuals/operator.md?raw'

export interface ManualPage {
  slug: string
  path: string
  label: string
  markdown: string
}

export const MANUAL_PAGES: ManualPage[] = [
  { slug: 'index', path: '/', label: '目次', markdown: index },
  { slug: 'learner', path: '/learner', label: '学習者', markdown: learner },
  { slug: 'instructor', path: '/instructor', label: '講師', markdown: instructor },
  { slug: 'admin', path: '/admin', label: '管理者', markdown: admin },
  { slug: 'developer', path: '/developer', label: '開発者', markdown: developer },
  { slug: 'operator', path: '/operator', label: '運用者', markdown: operator },
]

const SLUG_BY_FILE: Record<string, string> = {
  'readme.md': '/',
  'learner.md': '/learner',
  'instructor.md': '/instructor',
  'admin.md': '/admin',
  'developer.md': '/developer',
  'operator.md': '/operator',
}

/** マニュアル同士の .md リンクをアプリ内ルートへ変換する */
export function resolveManualHref(href: string | undefined): string | null {
  if (!href) return null
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return null
  }
  if (href.startsWith('#')) return href
  const [pathPart, hash] = href.split('#')
  const file = pathPart.split('/').pop()?.toLowerCase()
  if (!file || !file.endsWith('.md')) return null
  const route = SLUG_BY_FILE[file]
  if (!route) return null
  return hash ? `${route}#${hash}` : route
}

export function pageForPath(pathname: string): ManualPage {
  return MANUAL_PAGES.find((p) => p.path === pathname) ?? MANUAL_PAGES[0]
}
