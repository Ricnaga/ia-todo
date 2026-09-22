'use client'

import { Card, Title } from '@mantine/core'
import { RenderQueryBoundary } from '@/components/render-boundary/render-query-boundary'
import { ListAccounts } from './list-accounts/list-accounts'
import { SkeletonAccounts } from './skeleton-accounts/skeleton-accounts'

export function SectionAccounts() {
  return (
    <Card withBorder shadow="sm" padding="lg" className="max-w-md">
      <Title order={4} mb="sm">
        Contas vinculadas
      </Title>
      <RenderQueryBoundary fallback={<SkeletonAccounts />}>
        <ListAccounts />
      </RenderQueryBoundary>
    </Card>
  )
}
