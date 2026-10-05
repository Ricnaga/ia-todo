import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Hanken_Grotesk } from 'next/font/google'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Providers } from '@/providers'
import { env } from '@/lib/config/environment'
import './globals.css'

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_ORIGIN),
  title: 'ia-task-manager',
  description:
    'Gerenciador de tarefas com assistência de IA: sugestões, resumo diário e busca em linguagem natural.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      {...mantineHtmlProps}
      className={`${hankenGrotesk.variable} h-full antialiased`}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
