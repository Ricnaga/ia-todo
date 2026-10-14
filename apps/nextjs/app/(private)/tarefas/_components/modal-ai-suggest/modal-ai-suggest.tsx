'use client'

import { useState } from 'react'
import { Badge, Button, Card, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { IconPlus, IconSparkles } from '@tabler/icons-react'
import type { TodoSuggestion } from '@ia-task-manager/schemas/todo'
import type { DraftInput } from '@ia-task-manager/schemas/todo'
import { priorityColors, priorityLabels } from '@/lib/constants/todo.constants'
import { notifyAiError } from '@/lib/billing/notifications'
import { useSuggestTodoMutation } from '@/services/todo/todo.mutation'

type ModalAiSuggestProps = {
  opened: boolean
  onClose: () => void
  adding: boolean
  onAdd: (suggestion: TodoSuggestion) => void
}

export function ModalAiSuggest({ opened, onClose, adding, onAdd }: ModalAiSuggestProps) {
  const [draft, setDraft] = useState<DraftInput>({})
  const [draftError, setDraftError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<TodoSuggestion | null>(null)

  const suggestMutation = useSuggestTodoMutation()

  const pending = suggestMutation.isPending || adding

  const handleClose = () => {
    if (pending) return
    onClose()
    setSuggestion(null)
    setDraft({})
    setDraftError(null)
  }

  const resetSuggestion = () => {
    if (pending) return
    setSuggestion(null)
    suggestMutation.reset()
  }

  const handleDraftChange = (next: DraftInput) => {
    setDraft(next)
    setDraftError(null)
  }

  const handleSuggest = () => {
    const hasContent = Boolean((draft.title ?? '').trim() || (draft.description ?? '').trim())
    if (!hasContent) {
      setDraftError('Informe um título ou uma descrição para a IA sugerir.')
      return
    }
    suggestMutation.mutate(draft, {
      onSuccess: setSuggestion,
      onError: notifyAiError('Não consegui sugerir'),
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Sugerir tarefa com IA"
      size="lg"
      closeOnClickOutside={!pending}
      closeOnEscape={!pending}
      closeButtonProps={{ disabled: pending }}
    >
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
            onChange={(event) => handleDraftChange({ ...draft, title: event.currentTarget.value })}
          />
          <Textarea
            label="Descrição / contexto (opcional)"
            placeholder="Preciso revisar cálculo e física até sexta-feira…"
            autosize
            minRows={2}
            maxRows={4}
            value={draft.description ?? ''}
            onChange={(event) =>
              handleDraftChange({ ...draft, description: event.currentTarget.value })
            }
          />
          {draftError && (
            <Text size="xs" c="red">
              {draftError}
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="subtle" disabled={pending} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              leftSection={<IconSparkles size={16} />}
              loading={suggestMutation.isPending}
              disabled={pending}
              onClick={handleSuggest}
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
            <Card withBorder shadow="sm" padding="lg" bg="var(--mantine-color-gray-0)">
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
          <Card
            withBorder
            shadow="sm"
            padding="lg"
            onClick={resetSuggestion}
            style={{ cursor: pending ? 'default' : 'pointer' }}
          >
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
            <Button variant="subtle" disabled={pending} onClick={resetSuggestion}>
              Refazer sugestão
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              loading={adding}
              disabled={pending}
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
