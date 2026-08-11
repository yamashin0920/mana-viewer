interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function ContentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-card)]">
      <Skeleton className="aspect-[5/7] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}
