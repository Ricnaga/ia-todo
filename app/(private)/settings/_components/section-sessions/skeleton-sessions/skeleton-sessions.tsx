import { Skeleton } from '@mantine/core'

export function SkeletonSessions() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton circle height={18} width={18} />
          <Skeleton height={14} width={160} />
          <Skeleton height={14} width={48} className="ml-auto" />
        </div>
      ))}
    </div>
  )
}
