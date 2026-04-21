import clsx from 'clsx'

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
        className
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  )
}
