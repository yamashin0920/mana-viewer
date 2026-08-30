/**
 * キーボード利用者がヘッダーやサイドバーを読み飛ばして本文へ移動するためのリンク。
 * 普段は視覚的に隠れ、フォーカスが当たったときだけ現れる。
 */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      data-testid="skip-link"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
    >
      本文へスキップ
    </a>
  )
}
