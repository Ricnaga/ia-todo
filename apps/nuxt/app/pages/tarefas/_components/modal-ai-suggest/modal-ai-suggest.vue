<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const draftError = ref<string | null>(null)
const suggestion = ref<TodoSuggestion | null>(null)

const suggestMutation = useSuggestTodoMutation()
const { notifyError } = useNotifications()

const isSuggesting = suggestMutation.isPending
const pending = computed(() => isSuggesting.value || props.adding)

watch([() => draft.value.title, () => draft.value.description], () => {
  draftError.value = null
})

function onUpdateOpen(value: boolean) {
  if (!value) {
    handleClose()
    return
  }
  open.value = true
}

function handleClose() {
  if (pending.value) return
  open.value = false
  suggestion.value = null
  draft.value = { title: '', description: '' }
}

function resetSuggestion() {
  if (pending.value) return
  suggestion.value = null
  suggestMutation.error.value = null
  suggestMutation.data.value = null
}

function onSuggest() {
  if (draft.value.title.trim() === '' && draft.value.description.trim() === '') {
    draftError.value = 'Informe um título ou uma descrição para a IA sugerir.'
    return
  }
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
    :dismissible="!pending"
    :close="{ disabled: pending }"
    :ui="{ content: 'max-w-2xl' }"
    @update:open="onUpdateOpen"
  >
    <template #body>
      <div v-if="!suggestion" class="flex flex-col gap-4">
        <p class="text-dimmed text-sm">
          Descreva o que você precisa — pode ser só um tema, uma frase ou um rascunho. A IA
          estrutura em título, descrição, prioridade e subtasks.
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

        <p v-if="draftError" class="text-error text-xs">{{ draftError }}</p>

        <div class="flex justify-end gap-2">
          <UButton variant="subtle" :disabled="pending" @click="handleClose">Cancelar</UButton>
          <UButton
            icon="i-tabler:sparkles"
            :loading="isSuggesting"
            :disabled="pending"
            @click="onSuggest"
          >
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

        <UCard :class="pending ? '' : 'cursor-pointer'" @click="resetSuggestion">
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
          <UButton variant="subtle" :disabled="pending" @click="resetSuggestion">
            Refazer sugestão
          </UButton>
          <UButton icon="i-tabler:plus" :loading="props.adding" :disabled="pending" @click="onAdd">
            Adicionar tarefa
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
