import type { ReactNode } from 'react'
import { Card, Title } from '@mantine/core'

type CardAuthProps = {
  title: string
  children: ReactNode
}

export function CardAuth({ title, children }: CardAuthProps) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <Card withBorder shadow="sm" padding="xl" className="w-full max-w-md">
        <Title order={2} mb="lg">
          {title}
        </Title>
        {children}
      </Card>
    </div>
  )
}
