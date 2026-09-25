import { Skeleton } from '@mantine/core'
import { LoadingState } from '@/components/loading-state/loading-state'

export function SkeletonTodoManager() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton height={24} width={160} />
          <Skeleton height={12} width={200} />
        </div>
        <div className="flex gap-2">
          <Skeleton height={36} width={150} />
          <Skeleton height={36} width={130} />
        </div>
      </div>
      <LoadingState lines={8} rowHeight={36} />
    </div>
  )
}
