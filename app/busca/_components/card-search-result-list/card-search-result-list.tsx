import Link from 'next/link'
import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { Todo } from '@/lib/schemas/todo'
import type { SearchResult } from '@/lib/shared/assistant/search'
import type { SearchCriteria } from '@/lib/schemas/assistant'
import { priorityColors, priorityLabels } from '@/lib/shared/todos/todo.ui'
import { paths } from '@/lib/constants/router-paths'
import { EmptyState } from '../empty-state/empty-state'

const statusLabels: Record<SearchCriteria['status'], string> = {
  any: 'qualquer',
  pending: 'pendente',
  completed: 'concluída',
}

const dueLabels: Record<SearchCriteria['due'], string> = {
  any: 'qualquer',
  today: 'hoje',
  thisWeek: 'esta semana',
  overdue: 'atrasada',
  none: 'sem data',
}

function formatCriteria(criteria: SearchCriteria): string {
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

export function CardSearchResultList({ result }: { result: SearchResult }) {
  if (result.results.length === 0) {
    return <EmptyState message="Nenhuma tarefa corresponde à busca." />
  }

  return (
    <Card withBorder>
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
          {result.results.map((todo: Todo) => (
            <Card key={todo.id} withBorder p="sm">
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
          · {result.results.length} resultado(s)
        </Text>
      </Stack>
    </Card>
  )
}
