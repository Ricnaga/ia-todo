<script lang="ts">
  import type { Todo } from '@ia-task-manager/schemas/todo'

  interface Props {
    todo: Todo
  }

  let { todo }: Props = $props()
</script>

<span class="badge {todo.completed ? 'preset-tonal-success' : 'preset-tonal'}">
  {todo.completed ? 'Concluída' : 'Pendente'}
</span>
