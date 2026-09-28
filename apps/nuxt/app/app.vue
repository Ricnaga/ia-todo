<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="flex min-h-screen flex-col bg-(--ui-bg) text-(--ui-text)">
      <header class="flex items-center justify-end p-4">
        <ColorModeToggle />
      </header>
      <main class="flex-1">
        <NuxtWelcome />
      </main>
    </div>
  </UApp>
</template>
