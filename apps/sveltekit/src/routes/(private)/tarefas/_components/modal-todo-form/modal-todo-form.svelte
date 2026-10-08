<script lang="ts">
  import { onMount } from 'svelte'
  import { IconX } from '@tabler/icons-svelte'
  import { z } from 'zod'
  import { createTodoSchema } from '@ia-task-manager/schemas/todo'
  import type { CreateTodoFormInput, Todo, TodoPriority } from '@ia-task-manager/schemas/todo'
  import { priorityOptions } from '$lib/constants/todo.constants'
  import { toDateInputValue } from '$lib/utils/date'

  interface Props {
    mode: 'create' | 'edit'
    todo?: Todo
    onsubmit: (values: CreateTodoFormInput) => void
    onclose: () => void
  }

  type TodoFormState = {
    title: string
    description: string
    priority: TodoPriority
    dueDate: string
  }

  type TodoFormErrors = {
    title?: string[]
    description?: string[]
    priority?: string[]
    dueDate?: string[]
  }

  let { mode, todo, onsubmit, onclose }: Props = $props()

  let dialogEl: HTMLDialogElement | undefined = $state()

  let formState = $state<TodoFormState>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  })

  let errors = $state<TodoFormErrors>({})

  $effect(() => {
    formState.title = todo?.title ?? ''
    formState.description = todo?.description ?? ''
    formState.priority = todo?.priority ?? 'medium'
    formState.dueDate = todo?.dueDate ? toDateInputValue(todo.dueDate) : ''
  })

  onMount(() => {
    dialogEl?.showModal()
  })

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    const parsed = createTodoSchema.safeParse({ ...formState })
    if (!parsed.success) {
      errors = z.flattenError(parsed.error).fieldErrors
      return
    }
    errors = {}
    onsubmit({ ...formState })
  }

  function closeDialog(): void {
    dialogEl?.close()
  }

  function onDialogClose(): void {
    onclose()
  }

  function onDialogClick(event: MouseEvent): void {
    if (event.target !== dialogEl) return
    closeDialog()
  }
</script>

<dialog
  bind:this={dialogEl}
  class="dialog animate-dialog card border-line bg-surface border"
  style="--dialog-max-width: 42rem"
  onclose={onDialogClose}
  onclick={onDialogClick}
>
  <div class="flex flex-col gap-4">
    <header class="flex items-center justify-between">
      <h3 class="text-fg text-lg font-semibold">
        {mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'}
      </h3>
      <button
        type="button"
        class="btn-icon btn-icon-xs preset-tonal"
        aria-label="Fechar"
        onclick={closeDialog}
      >
        <IconX class="size-4" />
      </button>
    </header>

    <form class="flex flex-col gap-4" novalidate onsubmit={handleSubmit}>
      <div class="flex flex-col gap-1">
        <label class="label-text" for="todo-title">Título</label>
        <input
          id="todo-title"
          name="title"
          type="text"
          class="input"
          placeholder="Ex.: Preparar apresentação"
          bind:value={formState.title}
          required
        />
        {#if errors.title}
          <span class="text-error text-xs">{errors.title[0]}</span>
        {/if}
      </div>

      <div class="flex flex-col gap-1">
        <label class="label-text" for="todo-description">Descrição</label>
        <textarea
          id="todo-description"
          name="description"
          class="textarea"
          rows="2"
          placeholder="Detalhes da tarefa (opcional)"
          bind:value={formState.description}></textarea>
        {#if errors.description}
          <span class="text-error text-xs">{errors.description[0]}</span>
        {/if}
      </div>

      <div class="flex flex-col gap-1">
        <label class="label-text" for="todo-priority">Prioridade</label>
        <select id="todo-priority" name="priority" class="select" bind:value={formState.priority}>
          {#each priorityOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        {#if errors.priority}
          <span class="text-error text-xs">{errors.priority[0]}</span>
        {/if}
      </div>

      <div class="flex flex-col gap-1">
        <label class="label-text" for="todo-due-date">Vencimento</label>
        <input
          id="todo-due-date"
          name="dueDate"
          type="date"
          class="input"
          bind:value={formState.dueDate}
        />
        {#if errors.dueDate}
          <span class="text-error text-xs">{errors.dueDate[0]}</span>
        {/if}
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="btn preset-tonal" onclick={closeDialog}>
          <IconX class="size-4" />
          Cancelar
        </button>
        <button type="submit" class="btn preset-filled-primary-500">
          {mode === 'edit' ? 'Salvar' : 'Criar tarefa'}
        </button>
      </div>
    </form>
  </div>
</dialog>
