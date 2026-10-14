'use client'

import Link from 'next/link'
import { Anchor, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconSparkles } from '@tabler/icons-react'
import { GraphQLRequestError, PRO_REQUIRED_CODE } from '@ia-task-manager/bff/graphql'
import { paths } from '@/lib/constants/router-paths'
import { notifyError } from '@/lib/utils/notifications'

function isProRequired(error: unknown): boolean {
  return error instanceof GraphQLRequestError && error.code === PRO_REQUIRED_CODE
}

function notifyProRequired(): void {
  notifications.show({
    id: PRO_REQUIRED_CODE,
    title: 'Recurso do plano Pro',
    color: 'primary',
    autoClose: false,
    withCloseButton: true,
    icon: <IconSparkles size={18} />,
    message: (
      <Stack gap={4}>
        <Text size="sm">Este recurso usa IA e está disponível no plano Pro.</Text>
        <Anchor component={Link} href={paths.PLANOS} size="sm" fw={600}>
          Ver planos
        </Anchor>
      </Stack>
    ),
  })
}

export function notifyAiError(title: string) {
  return (error: unknown): void => {
    if (isProRequired(error)) {
      notifyProRequired()
      return
    }
    notifyError(title)(error)
  }
}
