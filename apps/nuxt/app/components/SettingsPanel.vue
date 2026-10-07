<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const items = [
  { value: 'profile', label: 'Perfil', icon: 'i-tabler:user-circle', slot: 'profile' },
  { value: 'security', label: 'Segurança', icon: 'i-tabler:fingerprint', slot: 'security' },
  { value: 'accounts', label: 'Contas vinculadas', icon: 'i-tabler:link', slot: 'accounts' },
  { value: 'sessions', label: 'Sessões ativas', icon: 'i-tabler:world', slot: 'sessions' },
] satisfies TabsItem[]
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-highlighted text-3xl/tight font-bold">Configurações</h1>

    <UTabs :items="items" orientation="vertical" default-value="profile" :unmount-on-hide="false">
      <template #profile>
        <SectionProfile />
      </template>
      <template #security>
        <SectionSecurity />
      </template>
      <template #accounts>
        <SectionAccounts />
      </template>
      <template #sessions>
        <SectionSessions />
      </template>
    </UTabs>
  </div>
</template>
