'use client'

import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import {
  IconClipboardList,
  IconPencil,
  IconPlus,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import type { Todo } from '@/lib/schemas/todo'
import { priorityColors, priorityLabels } from '@/lib/shared/todos/todo.ui'
import { formatDate } from '@/lib/utils/date'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useCreateTodo, useDeleteTodo, useUpdateTodo } from '@/services/todo/todo.mutation'
import { useTodos } from '@/services/todo/todo.query'
import { ModalTodoForm, type TodoFormInput } from '../modal-todo-form/modal-todo-form'
import { ModalAiSuggest } from '../modal-ai-suggest/modal-ai-suggest'

type FormModalState = {
  mode: 'create' | 'edit'
  todo?: Todo
}

export function TableTodoManager() {
  const [formModal, setFormModal] = useState<FormModalState | null>(null)
  const [aiOpened, setAiOpened] = useState<boolean>(false)

  const { data: todos = [], isLoading } = useTodos()

  const createMutation = useCreateTodo()
  const updateMutation = useUpdateTodo()
  const deleteMutation = useDeleteTodo()

  const handleSubmit = (mode: 'create' | 'edit', todo?: Todo) => (values: TodoFormInput) => {
    if (mode !== 'edit' || !todo) {
      createMutation.mutate(values, {
        onSuccess: () => {
          notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
          setFormModal(null)
        },
        onError: notifyError('Erro ao criar'),
      })
      return
    }
    updateMutation.mutate(
      { id: todo.id, input: values },
      {
        onSuccess: () => {
          notifySuccess('Tarefa atualizada', 'As alterações foram salvas.')
          setFormModal(null)
        },
        onError: notifyError('Erro ao atualizar'),
      },
    )
  }

  const handleToggleComplete = (todo: Todo, completed: boolean) => {
    updateMutation.mutate(
      { id: todo.id, input: { completed } },
      { onError: notifyError('Erro ao atualizar') },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Group justify="space-between">
        <div>
          <Title order={3}>Tarefas</Title>
          <Text size="sm" c="dimmed">
            {todos.length} no total · {todos.filter((t) => !t.completed).length} pendentes
          </Text>
        </div>
        <Group>
          <Button
            variant="light"
            leftSection={<IconSparkles size={18} />}
            onClick={() => setAiOpened(true)}
          >
            Sugerir com IA
          </Button>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setFormModal({ mode: 'create' })}
          >
            Nova tarefa
          </Button>
        </Group>
      </Group>

      <Card withBorder pos="relative">
        <LoadingOverlay visible={isLoading} zIndex={10} />

        {todos.length === 0 && !isLoading ? (
          <Stack align="center" gap="xs" py="xl">
            <IconClipboardList size={40} />
            <Text c="dimmed">Nenhuma tarefa ainda.</Text>
            <Text size="sm" c="dimmed">
              Crie manualmente ou peça uma sugestão à IA.
            </Text>
          </Stack>
        ) : (
          <Table highlightOnHover stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Concluída</Table.Th>
                <Table.Th>Título</Table.Th>
                <Table.Th>Prioridade</Table.Th>
                <Table.Th>Vencimento</Table.Th>
                <Table.Th>Subtasks</Table.Th>
                <Table.Th ta="right">Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {todos.map((todo) => (
                <Table.Tr key={todo.id}>
                  <Table.Td>
                    <Checkbox
                      checked={todo.completed}
                      onChange={(event) => handleToggleComplete(todo, event.currentTarget.checked)}
                      aria-label={`Marcar ${todo.title} como concluída`}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text
                      td={todo.completed ? 'line-through' : undefined}
                      c={todo.completed ? 'dimmed' : undefined}
                    >
                      {todo.title}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={priorityColors[todo.priority]} variant="light">
                      {priorityLabels[todo.priority]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(todo.dueDate)}</Table.Td>
                  <Table.Td>{todo.subtasks?.length ?? 0}</Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs" wrap="nowrap">
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconPencil size={14} />}
                        onClick={() => setFormModal({ mode: 'edit', todo })}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="compact-xs"
                        leftSection={<IconTrash size={14} />}
                        onClick={() =>
                          deleteMutation.mutate(todo.id, {
                            onSuccess: () =>
                              notifySuccess('Tarefa removida', 'A tarefa foi excluída.'),
                            onError: notifyError('Erro ao remover'),
                          })
                        }
                      >
                        Remover
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {formModal && (
        <ModalTodoForm
          mode={formModal.mode}
          todo={formModal.todo}
          onSubmit={handleSubmit(formModal.mode, formModal.todo)}
          onClose={() => setFormModal(null)}
        />
      )}

      <ModalAiSuggest
        opened={aiOpened}
        onClose={() => setAiOpened(false)}
        adding={createMutation.isPending}
        onAdd={(suggestion) => {
          createMutation.mutate(suggestion, {
            onSuccess: () => {
              notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
              setAiOpened(false)
            },
            onError: notifyError('Erro ao criar'),
          })
        }}
      />
    </div>
  )
}
