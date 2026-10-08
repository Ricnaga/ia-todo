<script lang="ts">
  import type { Todo } from '@ia-task-manager/schemas/todo'
  import { priorityColors, priorityLabels } from '$lib/constants/todo.constants'

  interface Props {
    todo: Todo
  }

  let { todo }: Props = $props()
</script>

<span class="badge {priorityColors[todo.priority]}">{priorityLabels[todo.priority]}</span>
