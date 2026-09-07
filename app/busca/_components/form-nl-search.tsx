'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge, Button, Card, Group, Kbd, Stack, Text, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconSearch } from '@tabler/icons-react'
import type { Todo } from '@/lib/shared/todos/todo.types'
import type { SearchResult } from '@/lib/shared/ai/search'
import { priorityColors, priorityLabels } from '@/lib/shared/todos/todo.ui'
import { useNlSearch } from '@/services/ai/ai.mutation'

const notifyError = (error: unknown) =>
  notifications.show({
    title: 'Não consegui buscar',
    message: error instanceof Error ? error.message : String(error),
    color: 'red',
  })

const statusLabels: Record<string, string> = {
  any: 'qualquer',
  pending: 'pendente',
  completed: 'concluída',
}

const dueLabels: Record<string, string> = {
  any: 'qualquer',
  today: 'hoje',
  'this-week': 'esta semana',
  overdue: 'atrasada',
  none: 'sem data',
}

function formatCriteria(result: SearchResult['criteria']): string {
  const parts: string[] = []
  if (result.keywords.length > 0) {
    parts.push(result.keywords.map((k) => `“${k}”`).join(', '))
  }
  parts.push(statusLabels[result.status])
  if (result.priority !== 'any') {
    parts.push(`prioridade ${priorityLabels[result.priority]}`)
  }
  parts.push(`vencimento ${dueLabels[result.due]}`)
  return parts.join(' · ')
}

export function FormNlSearch() {
  const [query, setQuery] = useState('')

  const mutation = useNlSearch()

  const result = mutation.data

  const renderEmpty = (text: string) => (
    <Text size="sm" c="dimmed">
      {text}
    </Text>
  )

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div>
        <Title order={3}>Busca em linguagem natural</Title>
        <Text size="sm" c="dimmed">
          Descreva o que procura em texto livre — a IA converte em filtros e aplica sobre suas
          tarefas.
        </Text>
      </div>

      <Group>
        <TextInput
          placeholder="Ex.: consultas de amanhã de alta prioridade"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && query.trim()) {
              mutation.mutate(query, { onError: notifyError })
            }
          }}
          style={{ flex: 1 }}
          rightSection={<Kbd>↵</Kbd>}
        />
        <Button
          leftSection={<IconSearch size={18} />}
          loading={mutation.isPending}
          disabled={!query.trim()}
          onClick={() => mutation.mutate(query, { onError: notifyError })}
        >
          Buscar
        </Button>
      </Group>

      {!result && !mutation.isPending && renderEmpty('Descreva uma busca para começar.')}
      {result && result.results.length === 0 && renderEmpty('Nenhuma tarefa corresponde à busca.')}
      {result && result.results.length > 0 && (
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
              <Link href="/tarefas" className="underline">
                Ver todas as tarefas
              </Link>{' '}
              · {result.results.length} resultado(s)
            </Text>
          </Stack>
        </Card>
      )}
    </div>
  )
}
