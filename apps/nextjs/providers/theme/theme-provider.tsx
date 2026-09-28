'use client'

import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
import { mantineTheme } from './mantine-theme'
import { AppNotifications } from './notifications'

type ThemeProviderProps = {
  children: ReactNode
}

/**
 * `defaultColorScheme="auto"` precisa continuar igual ao `ColorSchemeScript` do
 * `app/layout.tsx`: o script le a preferencia antes da primeira pintura e este
 * valor define o que o Mantine espera encontrar no <html>. Divergir entre os
 * dois da o flash de paleta que o design-tokens tenta eliminar.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <AppNotifications />
      {children}
    </MantineProvider>
  )
}
