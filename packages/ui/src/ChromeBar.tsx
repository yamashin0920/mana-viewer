import { type Key, type ReactNode } from 'react'

function renderParts<K extends string>(parts: Record<K, ReactNode>, ids: readonly K[]) {
  return ids.map((id) => {
    const node = parts[id]
    if (node == null) return null
    return (
      <span key={id as Key} className="contents">
        {node}
      </span>
    )
  })
}

/**
 * 名前付き部品をバー上の領域に並べる。
 *
 * - `leading` … 左（戻る・タイトルなど）
 * - `trailing` … 右に寄せる常時操作。`ml-auto` で左クラスタと分ける
 * - `children` … 展開トレイなど、配置表に載らない付加 UI
 */
export function ChromeBar<K extends string>({
  parts,
  leading,
  trailing = [],
  children,
  className = '',
  testId,
}: {
  parts: Record<K, ReactNode>
  leading: readonly K[]
  trailing?: readonly K[]
  children?: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={`flex flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 ${className}`}
    >
      {renderParts(parts, leading)}
      {trailing.length > 0 ? (
        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">{renderParts(parts, trailing)}</div>
      ) : null}
      {children}
    </div>
  )
}

export function renderChromeParts<K extends string>(parts: Record<K, ReactNode>, ids: readonly K[]) {
  return renderParts(parts, ids)
}
