'use client'

import { Button, Menu, useMantineColorScheme } from '@mantine/core'
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

const THEME_OPTIONS = [
  { value: 'auto', label: 'Sistema', icon: IconDeviceDesktop },
  { value: 'light', label: 'Claro', icon: IconSun },
  { value: 'dark', label: 'Escuro', icon: IconMoon },
] as const

/**
 * Escolhe o tema: sistema, claro ou escuro.
 *
 * O Mantine e o dono da preferencia -- persiste em `mantine-color-scheme-value`,
 * escreve `data-mantine-color-scheme` (que o `modes.css` dos design-tokens
 * escuta) e e lido pelo `ColorSchemeScript` antes da primeira pintura. Por isso
 * aqui nao ha store: uma segunda chave seria uma segunda fonte de verdade para
 * a mesma coisa.
 *
 * O icone do gatilho e escolhido por CSS (`dark:hidden` / `hidden dark:inline`)
 * e mostra o modo **efetivo**, nao o selecionado -- com "Sistema" ativo e o SO em
 * dark, aparece a lua. Mostrar o selecionado exigiria ler estado no client no
 * servidor, que e hydration mismatch: `useComputedColorScheme` devolve
 * `undefined` no SSR. O checkmark do item ativo le `colorScheme` direto porque o
 * `Menu.Dropdown` so monta na primeira abertura, sempre pos-hidratacao.
 */
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
