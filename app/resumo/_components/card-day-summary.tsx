'use client'

import { Button, Card, Group, List, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCircleCheck, IconSparkles } from '@tabler/icons-react'
import { useSummarizeDay } from '@/services/ai/ai.mutation'

const notifyError = (error: unknown) =>
  notifications.show({
    title: 'Não consegui gerar o resumo',
    message: error instanceof Error ? error.message : String(error),
    color: 'red',
  })

export function CardDaySummary() {
  const mutation = useSummarizeDay()

  const summary = mutation.data

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Group justify="space-between">
        <div>
          <Title order={3}>Resumo do dia</Title>
          <Text size="sm" c="dimmed">
            A IA lê suas tarefas pendentes e monta um plano de execução.
          </Text>
        </div>
        <Button
          leftSection={<IconSparkles size={18} />}
          loading={mutation.isPending}
          onClick={() => mutation.mutate(undefined, { onError: notifyError })}
        >
          Gerar resumo
        </Button>
      </Group>

      {mutation.isError && (
        <Text size="sm" c="red">
          Não foi possível gerar o resumo agora. Verifique a configuração da IA e tente novamente.
        </Text>
      )}

      {summary && (
        <Card withBorder>
          <Stack gap="md">
            <Text>{summary.summary}</Text>

            <div>
              <Group gap="xs" mb={6}>
                <ThemeIcon variant="light" size="sm" radius="xl">
                  <IconCircleCheck size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  Foco principal
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {summary.focus}
              </Text>
            </div>

            {summary.suggestedOrder.length > 0 && (
              <div>
                <Text fw={600} size="sm" mb={6}>
                  Ordem sugerida
                </Text>
                <List spacing="xs" withPadding>
                  {summary.suggestedOrder.map((item) => (
                    <List.Item key={item}>{item}</List.Item>
                  ))}
                </List>
              </div>
            )}
          </Stack>
        </Card>
      )}
    </div>
  )
}
