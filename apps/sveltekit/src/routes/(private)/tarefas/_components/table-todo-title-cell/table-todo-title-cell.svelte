<script lang="ts">
  import type { Todo } from '@ia-task-manager/schemas/todo'

  interface Props {
    todo: Todo
  }

  let { todo }: Props = $props()
</script>

<span class:text-muted={todo.completed} class:line-through={todo.completed}>{todo.title}</span>
