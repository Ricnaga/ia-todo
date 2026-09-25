import { Skeleton, Stack } from '@mantine/core'

type SkeletonStackProps = {
  lines?: number
  rowHeight?: number
}

export function SkeletonStack({ lines = 3, rowHeight = 16 }: SkeletonStackProps) {
  return (
    <Stack gap="sm">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} height={rowHeight} radius="sm" />
      ))}
    </Stack>
  )
}
