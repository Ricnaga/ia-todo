import { SkeletonStack } from '@/components/skeleton-stack/skeleton-stack'

type LoadingStateProps = {
  lines?: number
  rowHeight?: number
}

export function LoadingState({ lines = 3, rowHeight = 16 }: LoadingStateProps) {
  return (
    <div role="status" aria-busy="true">
      <SkeletonStack lines={lines} rowHeight={rowHeight} />
    </div>
  )
}
