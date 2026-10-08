<script lang="ts">
  import { onMount } from 'svelte'
  import { IconPlus, IconSparkles, IconX } from '@tabler/icons-svelte'
  import type { TodoSuggestion } from '@ia-task-manager/schemas/todo'
  import { priorityColors, priorityLabels } from '$lib/constants/todo.constants'
  import { useSuggestTodoMutation } from '$lib/services/todo/todo.mutation'
  import { notifyError } from '$lib/utils/notifications'

  interface Props {
    open: boolean
    adding: boolean
    onadd: (suggestion: TodoSuggestion) => void
    onclose: () => void
  }

  type DraftState = {
    title: string
    description: string
  }

  let { open, adding, onadd, onclose }: Props = $props()

  let dialogEl: HTMLDialogElement | undefined = $state()
  let draft = $state<DraftState>({ title: '', description: '' })
  let suggestion = $state<TodoSuggestion | null>(null)

  const suggestMutation = useSuggestTodoMutation()
  const isSuggesting = $derived(suggestMutation.isPending)

  $effect(() => {
    if (open) {
      dialogEl?.showModal()
      resetSuggestion()
      draft = { title: '', description: '' }
    } else {
      dialogEl?.close()
    }
  })

  onMount(() => {
    if (open) dialogEl?.showModal()
  })

  function handleClose(): void {
    if (isSuggesting) return
    onclose()
  }

  function onDialogClose(): void {
    onclose()
  }

  function onDialogCancel(event: Event): void {
    if (isSuggesting) event.preventDefault()
  }

  function onDialogClick(event: MouseEvent): void {
    if (isSuggesting || event.target !== dialogEl) return
    onclose()
  }

  function resetSuggestion(): void {
    suggestion = null
  }

  function onCardKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    resetSuggestion()
  }

  function onSuggest(): void {
    suggestMutation.mutate(draft, {
      onSuccess: (data) => {
        suggestion = data
      },
      onError: notifyError('Não consegui sugerir'),
    })
  }

  function onAdd(): void {
    if (!suggestion) return
    onadd(suggestion)
  }
</script>

<dialog
  bind:this={dialogEl}
  class="dialog animate-dialog card border-line bg-surface border"
  style="--dialog-max-width: 42rem"
  onclose={onDialogClose}
  oncancel={onDialogCancel}
  onclick={onDialogClick}
>
  <div class="flex flex-col gap-4">
    <header class="flex items-center justify-between">
      <h3 class="text-fg text-lg font-semibold">Sugerir tarefa com IA</h3>
      <button
        type="button"
        class="btn-icon btn-icon-xs preset-tonal"
        aria-label="Fechar"
        onclick={handleClose}
      >
        <IconX class="size-4" />
      </button>
    </header>

    {#if !suggestion}
      <div class="flex flex-col gap-4">
        <p class="text-muted text-sm">
          Descreva o que você precisa — pode ser só um tema, uma frase ou um rascunho. A IA
          estrutura em título, descrição, prioridade e subtasks.
        </p>

        <div class="flex flex-col gap-1">
          <label class="label-text" for="ai-title">Tema / título (opcional)</label>
          <input
            id="ai-title"
            type="text"
            class="input"
            placeholder="Montar plano de estudos"
            bind:value={draft.title}
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="label-text" for="ai-description">Descrição / contexto (opcional)</label>
          <textarea
            id="ai-description"
            class="textarea"
            rows="2"
            placeholder="Preciso revisar cálculo e física até sexta-feira…"
            bind:value={draft.description}></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="btn preset-tonal" onclick={handleClose}>Cancelar</button>
          <button
            type="button"
            class="btn preset-filled-primary-500"
            disabled={isSuggesting}
            aria-busy={isSuggesting}
            onclick={onSuggest}
          >
            <IconSparkles class="size-[18px]" />
            Sugerir
          </button>
        </div>
      </div>
    {:else}
      <div class="flex flex-col gap-4">
        <p class="text-muted text-sm">Sugestão da IA — revise e adicione:</p>

        {#if suggestion.subtasks.length > 0}
          <div class="card border-line bg-surface border p-3">
            <div class="flex flex-col gap-1">
              {#each suggestion.subtasks as subtask (subtask)}
                <div class="flex items-center gap-2">
                  <IconSparkles class="text-accent size-3.5 shrink-0" />
                  <p class="text-sm">{subtask}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div
          class="card border-line bg-surface border cursor-pointer p-3"
          role="button"
          tabindex="0"
          onclick={resetSuggestion}
          onkeydown={onCardKeydown}
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-semibold">{suggestion.title}</p>
            <span class="badge {priorityColors[suggestion.priority]}">
              {priorityLabels[suggestion.priority]}
            </span>
          </div>
          {#if suggestion.description}
            <p class="text-muted mt-1 text-sm">{suggestion.description}</p>
          {/if}
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="btn preset-tonal" onclick={resetSuggestion}>
            Refazer sugestão
          </button>
          <button
            type="button"
            class="btn preset-filled-primary-500"
            disabled={adding}
            aria-busy={adding}
            onclick={onAdd}
          >
            <IconPlus class="size-[18px]" />
            Adicionar tarefa
          </button>
        </div>
      </div>
    {/if}
  </div>
</dialog>
