'use client'

import { useState } from 'react'
import { Button, Card, Group, Text, Title } from '@mantine/core'
import { IconPlus, IconSparkles } from '@tabler/icons-react'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useCreateTodoMutation, useUpdateTodoMutation } from '@/services/todo/todo.mutation'
import { useTodosQuery } from '@/services/todo/todo.query'
import { ModalTodoForm, type TodoFormInput } from '../modal-todo-form/modal-todo-form'
import { ModalAiSuggest } from '../modal-ai-suggest/modal-ai-suggest'
import { TableTodoList } from '../table-todo-list/table-todo-list'

type FormModalState = {
  mode: 'create' | 'edit'
  todo?: Todo
}

export function ContentTodoManager() {
  const [formModal, setFormModal] = useState<FormModalState | null>(null)
  const [aiOpened, setAiOpened] = useState<boolean>(false)

  const { data: todos } = useTodosQuery()

  const createMutation = useCreateTodoMutation()
  const updateMutation = useUpdateTodoMutation()

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

  const pendingCount = todos.filter((t) => !t.completed).length

  return (
    <div className="flex flex-col gap-4">
      <Group justify="space-between">
        <div>
          <Title order={3}>Tarefas</Title>
          <Text size="sm" c="dimmed">
            {todos.length} no total · {pendingCount} pendentes
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

      <Card withBorder shadow="sm" padding="lg" pos="relative">
        <TableTodoList todos={todos} onEdit={(todo) => setFormModal({ mode: 'edit', todo })} />
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
