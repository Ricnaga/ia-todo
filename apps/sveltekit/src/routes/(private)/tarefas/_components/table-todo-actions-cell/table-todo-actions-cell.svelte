<script lang="ts">
  import { IconPencil, IconTrash } from '@tabler/icons-svelte'
  import type { Todo } from '@ia-task-manager/schemas/todo'

  interface Props {
    todo: Todo
    onedit: (todo: Todo) => void
    onremove: (todo: Todo) => void
  }

  let { todo, onedit, onremove }: Props = $props()
</script>

<div class="flex items-center justify-end gap-1">
  <button type="button" class="btn btn-xs preset-tonal" onclick={() => onedit(todo)}>
    <IconPencil class="size-3.5" />
    Editar
  </button>
  <button type="button" class="btn btn-xs preset-tonal-error" onclick={() => onremove(todo)}>
    <IconTrash class="size-3.5" />
    Remover
  </button>
</div>
