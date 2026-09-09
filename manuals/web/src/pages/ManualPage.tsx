import { useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { useLocation } from 'react-router-dom'
import { pageForPath } from '../catalog'
import { markdownComponents } from '../components/MarkdownLink'

export function ManualPage() {
  const { pathname, hash } = useLocation()
  const page = pageForPath(pathname)

  useEffect(() => {
    const scroller = document.querySelector('[data-testid="manuals-main"]')
    if (!hash) {
      scroller?.scrollTo(0, 0)
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    document.getElementById(id)?.scrollIntoView()
  }, [pathname, hash, page.markdown])

  return (
    <article className="manual-prose mx-auto max-w-3xl" data-testid="manual-article" data-manual-slug={page.slug}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={markdownComponents}>
        {page.markdown}
      </Markdown>
    </article>
  )
}
