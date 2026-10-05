'use client'

import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
import { mantineTheme } from './mantine-theme'
import { AppNotifications } from './notifications'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <AppNotifications />
      {children}
    </MantineProvider>
  )
}
