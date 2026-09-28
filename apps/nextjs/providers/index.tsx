'use client'

import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { SessionGuard } from '@/components/session-guard/session-guard'
import { mantineTheme } from '@/theme'
import { ReactQueryProvider } from './react-query'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <SessionGuard />
        {children}
      </MantineProvider>
    </ReactQueryProvider>
  )
}
