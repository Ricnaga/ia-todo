'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import type { Todo } from '@/lib/schemas/todo'
import { priorityOptions } from '@/lib/constants/todo.constants'
import { toDateInputValue } from '@/lib/utils/date'
import { createTodoSchema, type CreateTodoFormInput } from '@/lib/schemas/todo'

export type TodoFormInput = CreateTodoFormInput

type ModalTodoFormProps = {
  mode: 'create' | 'edit'
  todo?: Todo
  onSubmit: (values: TodoFormInput) => void
  onClose: () => void
}

export function ModalTodoForm({ mode, todo, onSubmit, onClose }: ModalTodoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      priority: todo?.priority ?? 'medium',
      dueDate: todo?.dueDate ? toDateInputValue(todo.dueDate) : '',
    },
  })

  return (
    <Modal opened onClose={onClose} title={mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'}>
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
          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" leftSection={<IconX size={16} />} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {mode === 'edit' ? 'Salvar' : 'Criar tarefa'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
