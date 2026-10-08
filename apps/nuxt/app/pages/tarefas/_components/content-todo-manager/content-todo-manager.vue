<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreateTodoFormInput, Todo, TodoSuggestion } from '@ia-task-manager/schemas/todo'
import { useNotifications } from '~/lib/utils/notifications'
import { useCreateTodoMutation, useUpdateTodoMutation } from '~/services/todo/todo.mutation'
import { useTodosQuery } from '~/services/todo/todo.query'
import FilterTodoList from '../filter-todo-list/filter-todo-list.vue'
import ModalAiSuggest from '../modal-ai-suggest/modal-ai-suggest.vue'
import ModalTodoForm from '../modal-todo-form/modal-todo-form.vue'
import SkeletonTodoManager from '../skeleton-todo-manager/skeleton-todo-manager.vue'
import TableTodoList from '../table-todo-list/table-todo-list.vue'

type FormModalState = {
  mode: 'create' | 'edit'
  todo?: Todo
}

const { notifyError, notifySuccess } = useNotifications()
const { data: todos, status, error, execute } = useTodosQuery()

const createMutation = useCreateTodoMutation()
const updateMutation = useUpdateTodoMutation()

const isCreating = createMutation.isPending
const isPending = computed(() => status.value === 'pending')
const items = computed(() => todos.value ?? [])
const pendingCount = computed(() => items.value.filter((todo) => !todo.completed).length)

const formModal = ref<FormModalState | null>(null)
const aiOpened = ref(false)

function openCreate() {
  formModal.value = { mode: 'create' }
}

function openAi() {
  aiOpened.value = true
}

function handleEdit(todo: Todo) {
  formModal.value = { mode: 'edit', todo }
}

function onSubmit(values: CreateTodoFormInput) {
  const modal = formModal.value
  if (!modal || modal.mode !== 'edit' || !modal.todo) {
    createMutation.mutate(values, {
      onSuccess: () => {
        notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
        formModal.value = null
      },
      onError: notifyError('Erro ao criar'),
    })
    return
  }

  updateMutation.mutate(
    { id: modal.todo.id, input: values },
    {
      onSuccess: () => {
        notifySuccess('Tarefa atualizada', 'As alterações foram salvas.')
        formModal.value = null
      },
      onError: notifyError('Erro ao atualizar'),
    },
  )
}

function onAdd(suggestion: TodoSuggestion) {
  createMutation.mutate(suggestion, {
    onSuccess: () => {
      notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
      aiOpened.value = false
    },
    onError: notifyError('Erro ao criar'),
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ErrorState v-if="error" retry @retry="execute()" />
    <SkeletonTodoManager v-else-if="isPending" />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-highlighted text-xl font-bold">Tarefas</h2>
          <p class="text-dimmed text-sm">
            {{ items.length }} no total · {{ pendingCount }} pendentes
          </p>
        </div>
        <div class="flex gap-2">
          <UButton icon="i-tabler:sparkles" variant="soft" @click="openAi">
            Sugerir com IA
          </UButton>
          <UButton icon="i-tabler:plus" @click="openCreate">Nova tarefa</UButton>
        </div>
      </div>

      <FilterTodoList />

      <UCard class="animate-in fade-in duration-base ease-entrance">
        <TableTodoList :todos="items" @edit="handleEdit" />
      </UCard>

      <ModalTodoForm
        v-if="formModal"
        :mode="formModal.mode"
        :todo="formModal.todo"
        @submit="onSubmit"
        @close="formModal = null"
      />

      <ModalAiSuggest v-model:open="aiOpened" :adding="isCreating" @add="onAdd" />
    </template>
  </div>
</template>
