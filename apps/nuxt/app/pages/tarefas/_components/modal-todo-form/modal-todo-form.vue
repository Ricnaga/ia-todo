<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { createTodoSchema } from '@ia-task-manager/schemas/todo'
import type { CreateTodoFormInput, Todo, TodoPriority } from '@ia-task-manager/schemas/todo'
import { priorityOptions, statusOptions } from '~/lib/constants/todo.constants'
import { toDateInputValue } from '~/lib/utils/date'

type TodoFormState = {
  title: string
  description: string
  priority: TodoPriority
  dueDate: string
  completed: boolean
}

const props = defineProps<{ mode: 'create' | 'edit'; todo?: Todo; pending?: boolean }>()
const emit = defineEmits<{ submit: [values: CreateTodoFormInput]; close: [] }>()

const open = ref(true)

const state = reactive<TodoFormState>({
  title: props.todo?.title ?? '',
  description: props.todo?.description ?? '',
  priority: props.todo?.priority ?? 'medium',
  dueDate: props.todo?.dueDate ? toDateInputValue(props.todo.dueDate) : '',
  completed: props.todo?.completed ?? false,
})

const status = computed({
  get: () => (state.completed ? 'completed' : 'pending'),
  set: (value: string) => {
    state.completed = value === 'completed'
  },
})

function onUpdateOpen(value: boolean) {
  if (!value && props.pending) return
  open.value = value
  if (!value) emit('close')
}

function onSubmit() {
  emit('submit', { ...state })
}
</script>

<template>
  <UModal
    :open="open"
    :title="props.mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'"
    :dismissible="!props.pending"
    :close="{ disabled: props.pending }"
    @update:open="onUpdateOpen"
  >
    <template #body>
      <UForm :schema="createTodoSchema" :state="state" :transform="false" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <UFormField label="Título" name="title" required>
            <UInput v-model="state.title" class="w-full" placeholder="Ex.: Preparar apresentação" />
          </UFormField>

          <UFormField label="Descrição" name="description">
            <UTextarea
              v-model="state.description"
              class="w-full"
              autoresize
              :rows="2"
              :maxrows="5"
              placeholder="Detalhes da tarefa (opcional)"
            />
          </UFormField>

          <UFormField label="Prioridade" name="priority">
            <USelect v-model="state.priority" class="w-full" :items="priorityOptions" />
          </UFormField>

          <UFormField label="Vencimento" name="dueDate">
            <UInput v-model="state.dueDate" class="w-full" type="date" />
          </UFormField>

          <UFormField label="Status" name="completed">
            <USelect v-model="status" :items="statusOptions" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              icon="i-tabler:x"
              variant="subtle"
              :disabled="props.pending"
              @click="emit('close')"
            >
              Cancelar
            </UButton>
            <UButton type="submit" :loading="props.pending" :disabled="props.pending">
              {{ props.mode === 'edit' ? 'Salvar' : 'Criar tarefa' }}
            </UButton>
          </div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
