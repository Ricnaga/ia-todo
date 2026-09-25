import { Skeleton } from '@mantine/core'

export function SkeletonAccounts() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton circle height={18} width={18} />
          <Skeleton height={14} width={72} />
          <Skeleton height={14} width={72} className="ml-auto" />
        </div>
      ))}
    </div>
  )
}
