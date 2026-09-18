import Link from 'next/link'
import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { Todo } from '@/lib/schemas/todo'
import type { Assistant, Criteria } from '@/lib/schemas/assistant'
import { priorityColors, priorityLabels } from '@/lib/shared/todos/todo.ui'
import { paths } from '@/lib/constants/router-paths'
import { SkeletonStack } from '@/components/skeleton-stack/skeleton-stack'
import { EmptyState } from '../empty-state/empty-state'

const statusLabels: Record<Criteria['status'], string> = {
  any: 'qualquer',
  pending: 'pendente',
  completed: 'concluída',
}

const dueLabels: Record<Criteria['due'], string> = {
  any: 'qualquer',
  today: 'hoje',
  thisWeek: 'esta semana',
  overdue: 'atrasada',
  none: 'sem data',
}

function formatCriteria(criteria: Criteria): string {
  const parts: string[] = []
  if (criteria.keywords.length > 0) {
    parts.push(criteria.keywords.map((keyword) => `“${keyword}”`).join(', '))
  }
  parts.push(statusLabels[criteria.status])
  if (criteria.priority !== 'any') {
    parts.push(`prioridade ${priorityLabels[criteria.priority]}`)
  }
  parts.push(`vencimento ${dueLabels[criteria.due]}`)
  return parts.join(' · ')
}

type CardSearchResultListProps = {
  result: Assistant | undefined
  isPending: boolean
}

export function CardSearchResultList({ result, isPending }: CardSearchResultListProps) {
  if (isPending) {
    return (
      <Card withBorder shadow="sm" padding="lg">
        <SkeletonStack rowHeight={18} />
      </Card>
    )
  }

  if (!result) {
    return <EmptyState message="Descreva uma busca para começar." />
  }

  if (result.todos.length === 0) {
    return <EmptyState message="Nenhuma tarefa corresponde à busca." />
  }

  return (
    <Card withBorder shadow="sm" padding="lg">
      <Stack gap="md">
        <Group gap={6}>
          <Text size="xs" c="dimmed" fw={600}>
            Filtros entendidos:
          </Text>
          <Badge variant="light" size="sm">
            {formatCriteria(result.criteria)}
          </Badge>
        </Group>

        <Stack gap="xs">
          {result.todos.map((todo: Todo) => (
            <Card key={todo.id} withBorder shadow="sm" padding="lg">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={600} td={todo.completed ? 'line-through' : undefined}>
                    {todo.title}
                  </Text>
                  {todo.description && (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {todo.description}
                    </Text>
                  )}
                </Stack>
                <Badge color={priorityColors[todo.priority]} variant="light" size="sm">
                  {priorityLabels[todo.priority]}
                </Badge>
              </Group>
            </Card>
          ))}
        </Stack>

        <Text size="xs" c="dimmed">
          <Link href={paths.TAREFAS} className="underline">
            Ver todas as tarefas
          </Link>{' '}
          · {result.todos.length} resultado(s)
        </Text>
      </Stack>
    </Card>
  )
}
