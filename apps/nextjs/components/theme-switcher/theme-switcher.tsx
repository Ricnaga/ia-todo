'use client'

import { Button, Menu, useMantineColorScheme } from '@mantine/core'
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

const THEME_OPTIONS = [
  { value: 'auto', label: 'Sistema', icon: IconDeviceDesktop },
  { value: 'light', label: 'Claro', icon: IconSun },
  { value: 'dark', label: 'Escuro', icon: IconMoon },
] as const

export function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  return (
    <Menu position="bottom-end" width={150}>
      <Menu.Target>
        <Button variant="subtle" px={6} aria-label="Alternar tema" title="Alternar tema">
          <span aria-hidden="true" className="dark:hidden">
            <IconSun size={18} />
          </span>
          <span aria-hidden="true" className="hidden dark:inline">
            <IconMoon size={18} />
          </span>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tema</Menu.Label>
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon

          return (
            <Menu.Item
              key={option.value}
              leftSection={<Icon size={16} />}
              rightSection={colorScheme === option.value ? <IconCheck size={14} /> : null}
              onClick={() => setColorScheme(option.value)}
            >
              {option.label}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
