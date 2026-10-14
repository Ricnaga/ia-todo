'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { priorityOptions, statusOptions } from '@/lib/constants/todo.constants'
import { toDateInputValue } from '@/lib/utils/date'
import { createTodoSchema, type CreateTodoFormInput } from '@ia-task-manager/schemas/todo'

export type TodoFormInput = CreateTodoFormInput

type ModalTodoFormProps = {
  mode: 'create' | 'edit'
  todo?: Todo
  pending: boolean
  onSubmit: (values: TodoFormInput) => void
  onClose: () => void
}

export function ModalTodoForm({ mode, todo, pending, onSubmit, onClose }: ModalTodoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      priority: todo?.priority ?? 'medium',
      dueDate: todo?.dueDate ? toDateInputValue(todo.dueDate) : '',
      completed: todo?.completed ?? false,
    },
  })

  return (
    <Modal
      opened
      onClose={onClose}
      title={mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'}
      closeOnClickOutside={!pending}
      closeOnEscape={!pending}
      closeButtonProps={{ disabled: pending }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Título"
            placeholder="Ex.: Preparar apresentação"
            required
            {...register('title')}
            error={errors.title?.message}
          />
          <Textarea
            label="Descrição"
            placeholder="Detalhes da tarefa (opcional)"
            autosize
            minRows={2}
            maxRows={5}
            {...register('description')}
            error={errors.description?.message}
          />
          <Controller
            control={control}
            name="priority"
            render={({ field }) => <Select label="Prioridade" data={priorityOptions} {...field} />}
          />
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <TextInput
                type="date"
                label="Vencimento"
                {...field}
                value={String(field.value ?? '')}
                error={errors.dueDate?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="completed"
            render={({ field }) => (
              <Select
                label="Status"
                data={statusOptions}
                value={field.value ? 'completed' : 'pending'}
                onChange={(value) => field.onChange(value === 'completed')}
                allowDeselect={false}
              />
            )}
          />
          <Group justify="flex-end" mt="xs">
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={pending}>
              {mode === 'edit' ? 'Salvar' : 'Criar tarefa'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
