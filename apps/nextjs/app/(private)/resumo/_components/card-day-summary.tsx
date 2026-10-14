'use client'

import { Button, Group, Text } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'
import { notifyAiError } from '@/lib/billing/notifications'
import { useDaySummaryQuery } from '@/services/insights/insights.query'
import { EmptyState } from '@/components/empty-state/empty-state'
import { CardDaySummaryContent } from './card-day-summary-content/card-day-summary-content'

export function CardDaySummary() {
  const { data: summary, isFetching, isError, refetch } = useDaySummaryQuery()

  return (
    <div className="flex flex-col gap-4">
      <Group justify="flex-end">
        <Button
          leftSection={<IconSparkles size={18} />}
          loading={isFetching}
          onClick={() => refetch().catch(notifyAiError('Não consegui gerar o resumo'))}
        >
          {summary ? 'Gerar novo resumo' : 'Gerar resumo'}
        </Button>
      </Group>

      {isError && (
        <Text size="sm" c="red">
          Não foi possível gerar o resumo agora. Verifique a configuração da IA e tente novamente.
        </Text>
      )}

      <CardDaySummaryContent summary={summary} isPending={isFetching} />
      {!summary && !isFetching && (
        <EmptyState message="Gere um resumo para ver o plano de execução do dia." />
      )}
    </div>
  )
}
