<script lang="ts">
  import { IconPlus, IconSparkles } from '@tabler/icons-svelte'
  import type { CreateTodoFormInput, Todo, TodoSuggestion } from '@ia-task-manager/schemas/todo'
  import FilterTodoList from '../filter-todo-list/filter-todo-list.svelte'
  import ModalAiSuggest from '../modal-ai-suggest/modal-ai-suggest.svelte'
  import ModalTodoForm from '../modal-todo-form/modal-todo-form.svelte'
  import TableTodoList from '../table-todo-list/table-todo-list.svelte'
  import { useCreateTodoMutation, useUpdateTodoMutation } from '$lib/services/todo/todo.mutation'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  interface Props {
    todos: Todo[]
  }

  type FormModalState = {
    mode: 'create' | 'edit'
    todo?: Todo
  }

  let { todos }: Props = $props()

  const createMutation = useCreateTodoMutation()
  const updateMutation = useUpdateTodoMutation()

  let formModal = $state<FormModalState | null>(null)
  let aiOpened = $state(false)

  const pendingCount = $derived(todos.filter((todo) => !todo.completed).length)
  const isCreating = $derived(createMutation.isPending)

  function openCreate(): void {
    formModal = { mode: 'create' }
  }

  function openAi(): void {
    aiOpened = true
  }

  function handleEdit(todo: Todo): void {
    formModal = { mode: 'edit', todo }
  }

  function handleSubmit(values: CreateTodoFormInput): void {
    const modal = formModal
    if (!modal || modal.mode !== 'edit' || !modal.todo) {
      createMutation.mutate(values, {
        onSuccess: () => {
          notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
          formModal = null
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
          formModal = null
        },
        onError: notifyError('Erro ao atualizar'),
      },
    )
  }

  function onAdd(suggestion: TodoSuggestion): void {
    createMutation.mutate(suggestion, {
      onSuccess: () => {
        notifySuccess('Tarefa criada', 'A tarefa foi criada com sucesso.')
        aiOpened = false
      },
      onError: notifyError('Erro ao criar'),
    })
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h2 class="text-fg text-xl font-bold">Tarefas</h2>
      <p class="text-muted text-sm">{todos.length} no total · {pendingCount} pendentes</p>
    </div>
    <div class="flex gap-2">
      <button type="button" class="btn preset-tonal" onclick={openAi}>
        <IconSparkles class="size-[18px]" />
        Sugerir com IA
      </button>
      <button type="button" class="btn preset-filled-primary-500" onclick={openCreate}>
        <IconPlus class="size-[18px]" />
        Nova tarefa
      </button>
    </div>
  </div>

  <FilterTodoList />

  <div
    class="animate-in fade-in duration-base ease-entrance card border-line bg-surface border p-4"
  >
    <TableTodoList {todos} onedit={handleEdit} />
  </div>

  {#if formModal}
    <ModalTodoForm
      mode={formModal.mode}
      todo={formModal.todo}
      onsubmit={handleSubmit}
      onclose={() => (formModal = null)}
    />
  {/if}

  <ModalAiSuggest
    open={aiOpened}
    adding={isCreating}
    onadd={onAdd}
    onclose={() => (aiOpened = false)}
  />
</div>
