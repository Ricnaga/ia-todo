import { Text } from '@mantine/core'

type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Text size="sm" c="dimmed">
      {message}
    </Text>
  )
}
