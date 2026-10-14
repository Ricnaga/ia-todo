<script lang="ts">
  import { Toast } from '@skeletonlabs/skeleton-svelte'
  import { toaster } from '$lib/toast'
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast}>
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.description}</Toast.Description>
      </Toast.Message>
      {#if toast.action}
        <Toast.ActionTrigger class="btn preset-filled-primary-500 btn-sm">
          {toast.action.label}
        </Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>
