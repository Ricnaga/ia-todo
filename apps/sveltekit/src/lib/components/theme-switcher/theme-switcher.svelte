<script lang="ts">
  import { Menu, Portal } from '@skeletonlabs/skeleton-svelte'
  import { IconCheck, IconDeviceDesktop, IconMoon, IconSun, type Icon } from '@tabler/icons-svelte'
  import { colorMode, type ColorModePreference } from '$lib/color-mode.svelte'

  const options: { value: ColorModePreference; label: string; icon: Icon }[] = [
    { value: 'auto', label: 'Sistema', icon: IconDeviceDesktop },
    { value: 'light', label: 'Claro', icon: IconSun },
    { value: 'dark', label: 'Escuro', icon: IconMoon },
  ]
</script>

<Menu>
  <Menu.Trigger class="btn-icon preset-tonal" aria-label="Alternar tema" title="Alternar tema">
    <span aria-hidden="true" class="dark:hidden"><IconSun class="size-5" /></span>
    <span aria-hidden="true" class="hidden dark:inline"><IconMoon class="size-5" /></span>
  </Menu.Trigger>

  <Portal>
    <Menu.Positioner>
      <Menu.Content
        class="border-line bg-elevated text-fg z-50 flex min-w-44 flex-col rounded-md border p-1 shadow-lg"
      >
        <Menu.ItemGroup>
          <Menu.ItemGroupLabel class="text-muted px-2 py-1.5 text-xs font-semibold uppercase">
            Tema
          </Menu.ItemGroupLabel>

          {#each options as { value, label, icon: Icon } (value)}
            <Menu.OptionItem
              type="radio"
              {value}
              checked={colorMode.preference === value}
              onCheckedChange={(checked) => checked && colorMode.setPreference(value)}
              class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-sunken"
            >
              <Icon class="text-muted size-4" />
              <Menu.ItemText class="flex-1 text-left">{label}</Menu.ItemText>
              <Menu.ItemIndicator class="hidden data-[state=checked]:block">
                <IconCheck class="text-accent size-4" />
              </Menu.ItemIndicator>
            </Menu.OptionItem>
          {/each}
        </Menu.ItemGroup>
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu>
