<script lang="ts">
  import { IconFingerprint, IconLink, IconUserCircle, IconWorld } from '@tabler/icons-svelte'
  import type { AuthAccount, AuthSession, AuthUser } from '@ia-task-manager/schemas/auth'
  import SectionAccounts from '$lib/components/SectionAccounts.svelte'
  import SectionProfile from '$lib/components/SectionProfile.svelte'
  import SectionSecurity from '$lib/components/SectionSecurity.svelte'
  import SectionSessions from '$lib/components/SectionSessions.svelte'

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: IconUserCircle },
    { id: 'security', label: 'Segurança', icon: IconFingerprint },
    { id: 'accounts', label: 'Contas vinculadas', icon: IconLink },
    { id: 'sessions', label: 'Sessões ativas', icon: IconWorld },
  ] as const

  type TabId = (typeof tabs)[number]['id']

  interface Props {
    user: AuthUser
    accounts: AuthAccount[]
    sessions: AuthSession[]
  }

  let { user, accounts, sessions }: Props = $props()

  let activeTab = $state<TabId>('profile')
  let tabButtons = $state<HTMLButtonElement[]>([])

  function selectTab(id: TabId): void {
    activeTab = id
  }

  function onTabKeydown(event: KeyboardEvent, index: number): void {
    const lastIndex = tabs.length - 1
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      next = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      next = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = lastIndex
    } else {
      return
    }
    event.preventDefault()
    activeTab = tabs[next].id
    tabButtons[next]?.focus()
  }
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-fg text-3xl/tight font-bold">Configurações</h1>

  <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
    <div
      class="flex flex-col gap-1"
      role="tablist"
      aria-orientation="vertical"
      aria-label="Seções de configurações"
    >
      {#each tabs as tab, index (tab.id)}
        {@const Icon = tab.icon}
        <button
          bind:this={tabButtons[index]}
          type="button"
          role="tab"
          id="settings-tab-{tab.id}"
          aria-controls="settings-panel-{tab.id}"
          aria-selected={activeTab === tab.id}
          tabindex={activeTab === tab.id ? 0 : -1}
          class="btn justify-start {activeTab === tab.id ? 'preset-tonal-primary' : 'preset-tonal'}"
          onclick={() => selectTab(tab.id)}
          onkeydown={(event) => onTabKeydown(event, index)}
        >
          <Icon class="size-4" />
          {tab.label}
        </button>
      {/each}
    </div>

    <div class="min-w-0 flex-1">
      <div
        class={activeTab === 'profile' ? undefined : 'hidden'}
        role="tabpanel"
        id="settings-panel-profile"
        aria-labelledby="settings-tab-profile"
        tabindex="0"
      >
        <SectionProfile {user} />
      </div>
      <div
        class={activeTab === 'security' ? undefined : 'hidden'}
        role="tabpanel"
        id="settings-panel-security"
        aria-labelledby="settings-tab-security"
        tabindex="0"
      >
        <SectionSecurity />
      </div>
      <div
        class={activeTab === 'accounts' ? undefined : 'hidden'}
        role="tabpanel"
        id="settings-panel-accounts"
        aria-labelledby="settings-tab-accounts"
        tabindex="0"
      >
        <SectionAccounts {accounts} />
      </div>
      <div
        class={activeTab === 'sessions' ? undefined : 'hidden'}
        role="tabpanel"
        id="settings-panel-sessions"
        aria-labelledby="settings-tab-sessions"
        tabindex="0"
      >
        <SectionSessions {sessions} />
      </div>
    </div>
  </div>
</div>
