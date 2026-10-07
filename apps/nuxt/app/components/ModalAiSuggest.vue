<script setup lang="ts">
import { ref } from 'vue'
import { priorityColors, priorityLabels } from '~/lib/constants/todo.constants'
import { useNotifications } from '~/lib/utils/notifications'
import { useSuggestTodoMutation } from '~/services/todo/todo.mutation'
import type { TodoSuggestion } from '@ia-task-manager/schemas/todo'

const props = defineProps<{ adding: boolean }>()
const emit = defineEmits<{ add: [suggestion: TodoSuggestion] }>()

const open = defineModel<boolean>('open', { required: true })

type DraftState = {
  title: string
  description: string
}

const draft = ref<DraftState>({ title: '', description: '' })
const suggestion = ref<TodoSuggestion | null>(null)

const suggestMutation = useSuggestTodoMutation()
const { notifyError } = useNotifications()

const isSuggesting = suggestMutation.isPending

function onUpdateOpen(value: boolean) {
  if (!value) {
    handleClose()
    return
  }
  open.value = true
}

function handleClose() {
  if (isSuggesting.value) return
  open.value = false
  suggestion.value = null
  draft.value = { title: '', description: '' }
}

function resetSuggestion() {
  suggestion.value = null
  suggestMutation.error.value = null
  suggestMutation.data.value = null
}

function onSuggest() {
  suggestMutation.mutate(draft.value, {
    onSuccess: (data) => {
      suggestion.value = data
    },
    onError: notifyError('Não consegui sugerir'),
  })
}

function onAdd() {
  if (!suggestion.value) return
  emit('add', suggestion.value)
}
</script>

<template>
  <UModal
    :open="open"
    title="Sugerir tarefa com IA"
    :dismissible="!isSuggesting"
    :ui="{ content: 'max-w-2xl' }"
    @update:open="onUpdateOpen"
  >
    <div v-if="!suggestion" class="flex flex-col gap-4">
      <p class="text-dimmed text-sm">
        Descreva o que você precisa — pode ser só um tema, uma frase ou um rascunho. A IA estrutura
        em título, descrição, prioridade e subtasks.
      </p>

      <UFormField label="Tema / título (opcional)">
        <UInput v-model="draft.title" class="w-full" placeholder="Montar plano de estudos" />
      </UFormField>

      <UFormField label="Descrição / contexto (opcional)">
        <UTextarea
          v-model="draft.description"
          class="w-full"
          autoresize
          :rows="2"
          :maxrows="4"
          placeholder="Preciso revisar cálculo e física até sexta-feira…"
        />
      </UFormField>

      <div class="flex justify-end gap-2">
        <UButton variant="subtle" @click="handleClose">Cancelar</UButton>
        <UButton icon="i-tabler:sparkles" :loading="isSuggesting" @click="onSuggest">
          Sugerir
        </UButton>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <p class="text-dimmed text-sm">Sugestão da IA — revise e adicione:</p>

      <UCard v-if="suggestion.subtasks.length > 0">
        <div class="flex flex-col gap-1">
          <div
            v-for="subtask in suggestion.subtasks"
            :key="subtask"
            class="flex items-center gap-2"
          >
            <UIcon name="i-tabler:sparkles" class="text-primary size-3.5 shrink-0" />
            <p class="text-sm">{{ subtask }}</p>
          </div>
        </div>
      </UCard>

      <UCard class="cursor-pointer" @click="resetSuggestion">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold">{{ suggestion.title }}</p>
          <UBadge :color="priorityColors[suggestion.priority]" variant="soft">
            {{ priorityLabels[suggestion.priority] }}
          </UBadge>
        </div>
        <p v-if="suggestion.description" class="text-dimmed mt-1 text-sm">
          {{ suggestion.description }}
        </p>
      </UCard>

      <div class="flex justify-end gap-2">
        <UButton variant="subtle" @click="resetSuggestion">Refazer sugestão</UButton>
        <UButton icon="i-tabler:plus" :loading="props.adding" @click="onAdd">
          Adicionar tarefa
        </UButton>
      </div>
    </div>
  </UModal>
</template>
