'use client'

import { Badge, Button, Group, List, Text } from '@mantine/core'
import { IconDeviceDesktop, IconLogout } from '@tabler/icons-react'
import { formatDate } from '@/lib/utils/date'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import type { AuthSession } from '@ia-task-manager/schemas/auth'
import { useMySessionsQuery, useRevokeSessionMutation } from '@/services/auth'

type SessionRow = {
  session: AuthSession
  isBusy: boolean
}

export function ListSessions() {
  const { data: sessions } = useMySessionsQuery()
  const revokeSession = useRevokeSessionMutation()

  const rows: SessionRow[] = sessions.map((session) => ({
    session,
    isBusy: revokeSession.isPending && revokeSession.variables?.token === session.token,
  }))

  function handleRevoke(token: string) {
    revokeSession.mutate(
      { token },
      {
        onError: notifyError('Não foi possível encerrar a sessão'),
        onSuccess: () => notifySuccess('Sessão encerrada', 'A sessão foi revogada.'),
      },
    )
  }

  if (sessions.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        Nenhuma sessão ativa.
      </Text>
    )
  }

  return (
    <List spacing="sm" icon={null}>
      {rows.map(({ session, isBusy }) => (
        <List.Item key={session.id}>
          <div className="flex items-center justify-between gap-2">
            <Group gap="sm">
              <IconDeviceDesktop size={18} />
              <div>
                <Text size="sm" lineClamp={1} className="max-w-56">
                  {session.userAgent || 'Dispositivo desconhecido'}
                </Text>
                <Text size="xs" c="dimmed">
                  {session.ipAddress || 'IP desconhecido'}
                  {' · expira em '}
                  {formatDate(session.expiresAt, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </div>
            </Group>
            <Badge size="sm" variant="light" color="gray">
              {session.token.length > 12 ? `${session.token.slice(0, 8)}...` : 'sessão'}
            </Badge>
            <Button
              size="compact-sm"
              variant="light"
              color="red"
              leftSection={<IconLogout size={14} />}
              loading={isBusy}
              onClick={() => handleRevoke(session.token)}
            >
              Encerrar
            </Button>
          </div>
        </List.Item>
      ))}
    </List>
  )
}
