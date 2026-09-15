import { Text, Title } from '@mantine/core'
import { CardDaySummary } from './_components/card-day-summary'

export default function ResumoPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <Title order={3}>Resumo do dia</Title>
        <Text size="sm" c="dimmed">
          A IA lê suas tarefas pendentes e monta um plano de execução.
        </Text>
      </div>
      <CardDaySummary />
    </div>
  )
}
