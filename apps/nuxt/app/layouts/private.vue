<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import { computed, ref, watch } from 'vue'
import { clearNuxtData, navigateTo, useRoute } from '#imports'
import { paths } from '~/lib/constants/paths'
import { authClient } from '~/services/auth/auth.client'
import { useMeQuery } from '~/services/auth/auth.query'

const route = useRoute()
const open = ref(true)

const { data: user, error } = await useMeQuery()

if (error.value) {
  throw error.value
}

if (!user.value) {
  await navigateTo({ path: paths.LOGIN, query: { next: route.path } })
}

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-tabler:home',
    to: paths.DASHBOARD,
    active: route.path === paths.DASHBOARD,
  },
  {
    label: 'Tarefas',
    icon: 'i-tabler:clipboard-list',
    to: paths.TAREFAS,
    active: route.path === paths.TAREFAS,
  },
  {
    label: 'Resumo do dia',
    icon: 'i-tabler:sparkles',
    to: paths.RESUMO,
    active: route.path === paths.RESUMO,
  },
  {
    label: 'Busca por IA',
    icon: 'i-tabler:search',
    to: paths.BUSCA,
    active: route.path === paths.BUSCA,
  },
])

const settingsItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Configurações',
    icon: 'i-tabler:settings',
    to: paths.SETTINGS,
    active: route.path === paths.SETTINGS,
  },
])

const accountItems = computed<DropdownMenuItem[]>(() => [
  { label: user.value?.name ?? 'Minha conta', type: 'label' as const },
  { label: 'Configurações', icon: 'i-tabler:settings', to: paths.SETTINGS },
  { label: 'Sair', icon: 'i-tabler:logout', color: 'error' as const, onSelect: handleSignOut },
])

watch(user, (value) => {
  if (!value) {
    navigateTo({ path: paths.LOGIN, query: { next: route.path } })
  }
})

async function handleSignOut() {
  await clearNuxtData()
  await authClient.signOut()
  await navigateTo(paths.LOGIN)
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <UHeader toggle-side="left">
      <template #title>
        <NuxtLink :to="paths.DASHBOARD" class="flex items-center gap-1.5">
          <UIcon name="i-tabler:sparkles" class="size-5" />
          <span class="text-highlighted">ia-task-manager</span>
        </NuxtLink>
      </template>

      <template #right>
        <ThemeSwitcher />

        <UDropdownMenu :items="accountItems" :content="{ align: 'end', collisionPadding: 12 }">
          <UAvatar
            :src="user?.image ?? undefined"
            :alt="user?.name ?? 'Usuário'"
            size="sm"
            class="cursor-pointer"
          />
        </UDropdownMenu>
      </template>

      <template #toggle>
        <UButton
          icon="i-tabler:menu"
          color="neutral"
          variant="ghost"
          aria-label="Alternar menu lateral"
          class="lg:hidden"
          @click="open = !open"
        />
      </template>
    </UHeader>

    <div class="flex min-h-0 flex-1">
      <USidebar
        v-model:open="open"
        :ui="{
          container: 'top-(--ui-header-height)! h-[calc(100svh-var(--ui-header-height))]!',
        }"
      >
        <UNavigationMenu :items="navItems" orientation="vertical" />

        <template #footer>
          <UNavigationMenu :items="settingsItems" orientation="vertical" />
        </template>
      </USidebar>

      <UMain class="min-w-0 flex-1">
        <slot />
      </UMain>
    </div>
  </div>
</template>
