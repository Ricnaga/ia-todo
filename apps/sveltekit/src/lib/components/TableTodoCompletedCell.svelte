<script lang="ts">
  import type { Todo } from '@ia-task-manager/schemas/todo'

  interface Props {
    todo: Todo
    ontoggle: (completed: boolean) => void
  }

  let { todo, ontoggle }: Props = $props()
</script>

<input
  type="checkbox"
  class="checkbox"
  checked={todo.completed}
  aria-label={`Marcar ${todo.title} como concluída`}
  onchange={(event) => ontoggle(event.currentTarget.checked)}
/>
