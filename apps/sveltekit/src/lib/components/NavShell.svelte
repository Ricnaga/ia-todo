<script lang="ts">
  import type { Snippet } from 'svelte'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { Avatar, Menu, Portal } from '@skeletonlabs/skeleton-svelte'
  import {
    IconClipboardList,
    IconHome,
    IconLogout,
    IconSearch,
    IconSettings,
    IconSparkles,
    type Icon,
  } from '@tabler/icons-svelte'
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte'
  import { paths, type TPath } from '$lib/constants/paths'
  import { authClient } from '$lib/services/auth/auth.client'
  import type { AuthUser } from '@ia-task-manager/schemas/auth'

  interface NavItem {
    label: string
    href: TPath
    icon: Icon
  }

  interface Props {
    user: AuthUser
    children: Snippet
  }

  let { user, children }: Props = $props()

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: paths.DASHBOARD, icon: IconHome },
    { label: 'Tarefas', href: paths.TAREFAS, icon: IconClipboardList },
    { label: 'Resumo do dia', href: paths.RESUMO, icon: IconSparkles },
    { label: 'Busca por IA', href: paths.BUSCA, icon: IconSearch },
  ]

  const settingsItems: NavItem[] = [
    { label: 'Configurações', href: paths.SETTINGS, icon: IconSettings },
  ]

  const pathname = $derived(page.url.pathname)
  const initials = $derived(
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase(),
  )

  function isActive(href: TPath): boolean {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function itemClass(href: TPath): string {
    const active = isActive(href)
    return `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-hover hover:text-fg'
    }`
  }

  async function handleMenuSelect(details: { value: string }): Promise<void> {
    if (details.value === 'settings') {
      await goto(resolve(paths.SETTINGS))
      return
    }

    if (details.value === 'sign-out') {
      await authClient.signOut()
      await goto(resolve(paths.LOGIN), { invalidateAll: true })
    }
  }
</script>

<div class="flex min-h-screen flex-col">
  <header
    class="border-line bg-surface/90 sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4"
  >
    <a href={resolve(paths.DASHBOARD)} class="flex items-center gap-1.5">
      <IconSparkles class="size-5" />
      <span class="text-highlighted font-semibold">ia-task-manager</span>
    </a>

    <div class="ml-auto flex items-center gap-2">
      <ThemeSwitcher />

      <Menu onSelect={handleMenuSelect}>
        <Menu.Trigger
          class="flex size-8 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-ring focus-visible:ring-2"
          aria-label="Abrir menu da conta"
          title="Minha conta"
        >
          <Avatar
            class="bg-accent-soft text-accent flex size-8 items-center justify-center overflow-hidden rounded-full text-xs font-semibold"
          >
            {#if user.image}
              <Avatar.Image src={user.image} alt={user.name} class="size-full object-cover" />
            {/if}
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content
              class="border-line bg-elevated text-fg z-50 flex min-w-48 flex-col rounded-md border p-1 shadow-lg"
            >
              <Menu.ItemGroup>
                <Menu.ItemGroupLabel
                  class="text-muted max-w-56 truncate px-2 py-1.5 text-xs font-semibold"
                >
                  {user.name}
                </Menu.ItemGroupLabel>

                {#each settingsItems as { label, href, icon: Icon } (href)}
                  <Menu.Item
                    value={href}
                    class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-sunken"
                  >
                    <Icon class="text-muted size-4" />
                    <Menu.ItemText>{label}</Menu.ItemText>
                  </Menu.Item>
                {/each}
              </Menu.ItemGroup>

              <Menu.Item
                value="sign-out"
                class="text-error flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-error-soft"
              >
                <IconLogout class="size-4" />
                <Menu.ItemText>Sair</Menu.ItemText>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu>
    </div>
  </header>

  <nav
    class="border-line bg-surface flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden"
    aria-label="Navegação principal"
  >
    {#each navItems as { label, href, icon: Icon } (href)}
      <a
        href={resolve(href)}
        aria-current={isActive(href) ? 'page' : undefined}
        class="{itemClass(href)} shrink-0"
      >
        <Icon class="size-4" />
        {label}
      </a>
    {/each}
  </nav>

  <div class="flex min-h-0 flex-1">
    <aside class="border-line hidden w-60 shrink-0 flex-col border-r p-3 md:flex">
      <nav class="flex flex-col gap-1" aria-label="Navegação principal">
        {#each navItems as { label, href, icon: Icon } (href)}
          <a
            href={resolve(href)}
            aria-current={isActive(href) ? 'page' : undefined}
            class={itemClass(href)}
          >
            <Icon class="size-4" />
            {label}
          </a>
        {/each}
      </nav>

      <div class="border-line mt-auto flex flex-col gap-1 border-t pt-3">
        {#each settingsItems as { label, href, icon: Icon } (href)}
          <a
            href={resolve(href)}
            aria-current={isActive(href) ? 'page' : undefined}
            class={itemClass(href)}
          >
            <Icon class="size-4" />
            {label}
          </a>
        {/each}
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      {@render children()}
    </main>
  </div>
</div>
