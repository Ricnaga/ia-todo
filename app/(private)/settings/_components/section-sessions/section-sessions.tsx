'use client'

import { Button, Card, Title } from '@mantine/core'
import { IconShieldX } from '@tabler/icons-react'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useRevokeOtherSessionsMutation } from '@/services/auth'
import { RenderQueryBoundary } from '@/components/render-boundary/render-query-boundary'
import { ListSessions } from './list-sessions/list-sessions'
import { SkeletonSessions } from './skeleton-sessions/skeleton-sessions'

export function SectionSessions() {
  const revokeOthers = useRevokeOtherSessionsMutation()

  function handleRevokeOthers() {
    revokeOthers.mutate(undefined, {
      onError: notifyError('Não foi possível encerrar as sessões'),
      onSuccess: () => notifySuccess('Sessões encerradas', 'As demais sessões foram revogadas.'),
    })
  }

  return (
    <Card withBorder shadow="sm" padding="lg" className="max-w-md">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Title order={4}>Sessões ativas</Title>
        <Button
          size="compact-sm"
          variant="light"
          color="red"
          leftSection={<IconShieldX size={14} />}
          loading={revokeOthers.isPending}
          onClick={handleRevokeOthers}
        >
          Revogar outras sessões
        </Button>
      </div>
      <RenderQueryBoundary fallback={<SkeletonSessions />}>
        <ListSessions />
      </RenderQueryBoundary>
    </Card>
  )
}
