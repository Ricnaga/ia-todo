'use client'

import { Button, Group, Text } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'
import { notifyError } from '@/lib/utils/notifications'
import { useSummarizeDay } from '@/services/insights/insights.mutation'
import { EmptyState } from './empty-state/empty-state'
import { CardDaySummaryContent } from './card-day-summary-content/card-day-summary-content'

export function CardDaySummary() {
  const { data: summary, isPending, isError, mutate } = useSummarizeDay()

  return (
    <div className="flex flex-col gap-4">
      <Group justify="flex-end">
        <Button
          leftSection={<IconSparkles size={18} />}
          loading={isPending}
          onClick={() => mutate(undefined, { onError: notifyError('Não consegui gerar o resumo') })}
        >
          Gerar resumo
        </Button>
      </Group>

      {isError && (
        <Text size="sm" c="red">
          Não foi possível gerar o resumo agora. Verifique a configuração da IA e tente novamente.
        </Text>
      )}

      {summary && <CardDaySummaryContent summary={summary} />}
      {!summary && !isPending && (
        <EmptyState message="Gere um resumo para ver o plano de execução do dia." />
      )}
    </div>
  )
}
