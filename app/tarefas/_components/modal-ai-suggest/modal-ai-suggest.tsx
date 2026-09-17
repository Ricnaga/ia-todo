'use client'

import { useState } from 'react'
import { Badge, Button, Card, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { IconPlus, IconSparkles } from '@tabler/icons-react'
import type { TodoSuggestion, DraftInput } from '@/lib/schemas/todo'
import { priorityColors, priorityLabels } from '@/lib/shared/todos/todo.ui'
import { notifyError } from '@/lib/utils/notifications'
import { useSuggestTodoMutation } from '@/services/todo/todo.mutation'

type ModalAiSuggestProps = {
  opened: boolean
  onClose: () => void
  adding: boolean
  onAdd: (suggestion: TodoSuggestion) => void
}

export function ModalAiSuggest({ opened, onClose, adding, onAdd }: ModalAiSuggestProps) {
  const [draft, setDraft] = useState<DraftInput>({})
  const [suggestion, setSuggestion] = useState<TodoSuggestion | null>(null)

  const suggestMutation = useSuggestTodoMutation()

  const handleClose = () => {
    if (suggestMutation.isPending) return
    onClose()
    setSuggestion(null)
    setDraft({})
  }

  const resetSuggestion = () => {
    setSuggestion(null)
    suggestMutation.reset()
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Sugerir tarefa com IA" size="lg">
      {!suggestion ? (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Descreva o que você precisa — pode ser só um tema, uma frase ou um rascunho. A IA
            estrutura em título, descrição, prioridade e subtasks.
          </Text>
          <TextInput
            label="Tema / título (opcional)"
            placeholder="Montar plano de estudos"
            value={draft.title ?? ''}
            onChange={(event) => setDraft({ ...draft, title: event.currentTarget.value })}
          />
          <Textarea
            label="Descrição / contexto (opcional)"
            placeholder="Preciso revisar cálculo e física até sexta-feira…"
            autosize
            minRows={2}
            maxRows={4}
            value={draft.description ?? ''}
            onChange={(event) => setDraft({ ...draft, description: event.currentTarget.value })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              leftSection={<IconSparkles size={16} />}
              loading={suggestMutation.isPending}
              onClick={() =>
                suggestMutation.mutate(draft, {
                  onSuccess: setSuggestion,
                  onError: notifyError('Não consegui sugerir'),
                })
              }
            >
              Sugerir
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Sugestão da IA — revise e adicione:
          </Text>
          {suggestion.subtasks.length > 0 && (
            <Card withBorder bg="var(--mantine-color-gray-0)">
              <Stack gap={4}>
                {suggestion.subtasks.map((subtask) => (
                  <Group key={subtask} gap="xs">
                    <IconSparkles size={14} />
                    <Text size="sm">{subtask}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          )}
          <Card withBorder p="md" onClick={resetSuggestion} style={{ cursor: 'pointer' }}>
            <Group justify="space-between">
              <Text fw={600}>{suggestion.title}</Text>
              <Badge color={priorityColors[suggestion.priority]} variant="light">
                {priorityLabels[suggestion.priority]}
              </Badge>
            </Group>
            {suggestion.description && (
              <Text size="sm" c="dimmed" mt={4}>
                {suggestion.description}
              </Text>
            )}
          </Card>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={resetSuggestion}>
              Refazer sugestão
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              loading={adding}
              onClick={() => onAdd(suggestion)}
            >
              Adicionar tarefa
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  )
}
