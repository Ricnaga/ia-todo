import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Providers } from '@/providers'
import { NavShell } from '@/components/nav-shell'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ia-task-manager',
  description:
    'Gerenciador de tarefas com assistência de IA: sugestões, resumo diário e busca em linguagem natural.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      {...mantineHtmlProps}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="min-h-full">
        <Providers>
          <NavShell>{children}</NavShell>
        </Providers>
      </body>
    </html>
  )
}
