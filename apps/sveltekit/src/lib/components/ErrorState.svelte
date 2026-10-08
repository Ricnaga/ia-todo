<script lang="ts">
  import { IconAlertCircle, type Icon as IconType } from '@tabler/icons-svelte'

  interface Props {
    icon?: IconType
    title?: string
    message?: string
    retry?: boolean
    retryLabel?: string
    onretry?: () => void
  }

  let {
    icon: Icon = IconAlertCircle,
    title = 'Erro ao carregar',
    message = undefined,
    retry = false,
    retryLabel = 'Tentar novamente',
    onretry,
  }: Props = $props()
</script>

<div role="alert" class="flex flex-col items-center justify-center gap-2 py-10 text-center">
  <span class="bg-error-soft text-error flex size-12 items-center justify-center rounded-full">
    <Icon class="size-7" />
  </span>
  <p class="text-fg text-lg font-semibold">{title}</p>
  {#if message}
    <p class="text-muted max-w-sm text-sm">{message}</p>
  {/if}
  {#if retry}
    <button type="button" class="btn preset-tonal-error mt-2" onclick={() => onretry?.()}>
      {retryLabel}
    </button>
  {/if}
</div>
