import { Badge, Button, Checkbox, Group, Stack, Table, Text } from '@mantine/core'
import { IconClipboardList, IconPencil, IconTrash } from '@tabler/icons-react'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { priorityColors, priorityLabels } from '@/lib/constants/todo.constants'
import { formatDate } from '@/lib/utils/date'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@/services/todo/todo.mutation'

type TableTodoListProps = {
  todos: Todo[]
  onEdit: (todo: Todo) => void
}

export function TableTodoList({ todos, onEdit }: TableTodoListProps) {
  const updateMutation = useUpdateTodoMutation()
  const deleteMutation = useDeleteTodoMutation()

  const handleToggleComplete = (todo: Todo, completed: boolean) => {
    updateMutation.mutate(
      { id: todo.id, input: { completed } },
      { onError: notifyError('Erro ao atualizar') },
    )
  }

  if (todos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <IconClipboardList size={40} />
        <Text c="dimmed">Nenhuma tarefa ainda.</Text>
        <Text size="sm" c="dimmed">
          Crie manualmente ou peça uma sugestão à IA.
        </Text>
      </Stack>
    )
  }

  return (
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
                  onClick={() => onEdit(todo)}
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
                      onSuccess: () => notifySuccess('Tarefa removida', 'A tarefa foi excluída.'),
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
  )
}
