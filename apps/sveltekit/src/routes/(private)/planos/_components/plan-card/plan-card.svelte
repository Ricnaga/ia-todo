<script lang="ts">
  import type { Snippet } from 'svelte'
  import { IconCheck, IconLoader2 } from '@tabler/icons-svelte'

  interface Props {
    title: string
    price: string
    priceCaption: string
    features: readonly string[]
    ctaLabel: string
    highlighted?: boolean
    badge?: string
    ctaDisabled?: boolean
    ctaLoading?: boolean
    oncta?: () => void
    children?: Snippet
  }

  let {
    title,
    price,
    priceCaption,
    features,
    ctaLabel,
    highlighted = false,
    badge,
    ctaDisabled = false,
    ctaLoading = false,
    oncta,
    children,
  }: Props = $props()
</script>

<div
  class="card bg-surface flex h-full flex-col gap-4 border p-5 {highlighted
    ? 'border-accent border-2'
    : 'border-line'}"
>
  <div class="flex items-center justify-between gap-2">
    <h2 class="text-fg text-lg font-semibold">{title}</h2>
    {#if badge}
      <span class="badge preset-tonal-primary">{badge}</span>
    {/if}
  </div>

  {#if children}
    {@render children()}
  {/if}

  <div>
    <p class="text-fg text-2xl font-bold">{price}</p>
    <p class="text-muted text-xs">{priceCaption}</p>
  </div>

  <ul class="flex flex-col gap-2">
    {#each features as feature (feature)}
      <li class="flex items-start gap-2">
        <IconCheck class="text-accent mt-0.5 size-4 shrink-0" />
        <span class="text-sm">{feature}</span>
      </li>
    {/each}
  </ul>

  <button
    type="button"
    class="btn mt-auto w-full {highlighted ? 'preset-filled-primary-500' : 'preset-tonal'}"
    disabled={ctaDisabled || ctaLoading}
    aria-busy={ctaLoading}
    onclick={() => oncta?.()}
  >
    {#if ctaLoading}
      <IconLoader2 class="size-[18px] animate-spin" />
    {/if}
    {ctaLabel}
  </button>
</div>
