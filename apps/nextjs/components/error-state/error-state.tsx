import { Button, Text, ThemeIcon } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

type ErrorStateProps = {
  icon?: ReactNode
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  icon = (
    <ThemeIcon variant="light" color="red" size="xl" radius="xl">
      <IconAlertCircle size={32} />
    </ThemeIcon>
  ),
  title = 'Erro ao carregar',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon}
      <Text fw={600} size="lg">
        {title}
      </Text>
      {message && (
        <Text size="sm" c="dimmed" className="max-w-sm">
          {message}
        </Text>
      )}
      {onRetry && (
        <Button variant="light" color="red" mt="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
