<script lang="ts">
  import { IconExternalLink, IconLinkOff, type Icon as IconType } from '@tabler/icons-svelte'

  interface Props {
    label: string
    icon: IconType
    linked: boolean
    busy: boolean
    onlink: () => void
    onunlink: () => void
  }

  let { label, icon: Icon, linked, busy, onlink, onunlink }: Props = $props()
</script>

<div class="flex flex-wrap items-center justify-between gap-2">
  <div class="flex min-w-0 items-center gap-3">
    <Icon class="size-[18px] shrink-0" />
    <span>{label}</span>
    {#if linked}
      <span class="badge preset-tonal-success">Vinculada</span>
    {:else}
      <span class="badge preset-tonal">Não vinculada</span>
    {/if}
  </div>

  {#if linked}
    <button
      type="button"
      class="btn btn-xs preset-tonal-error"
      disabled={busy}
      onclick={() => onunlink()}
    >
      <IconLinkOff class="size-4" />
      Desvincular
    </button>
  {:else}
    <button type="button" class="btn btn-xs preset-tonal" disabled={busy} onclick={() => onlink()}>
      <IconExternalLink class="size-4" />
      Vincular
    </button>
  {/if}
</div>
