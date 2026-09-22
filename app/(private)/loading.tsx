import { Skeleton } from '@mantine/core'
import { LoadingState } from '@/components/loading-state/loading-state'

export default function PrivateLoading() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Skeleton height={28} width={200} radius="md" />
      <LoadingState lines={6} rowHeight={24} />
    </div>
  )
}
