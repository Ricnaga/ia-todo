'use client'

import { RenderQueryBoundary } from '@/components/render-boundary/render-query-boundary'
import { ContentTodoManager } from '../content-todo-manager/content-todo-manager'
import { SkeletonTodoManager } from '../skeleton-todo-manager/skeleton-todo-manager'

export function TableTodoManager() {
  return (
    <RenderQueryBoundary fallback={<SkeletonTodoManager />}>
      <ContentTodoManager />
    </RenderQueryBoundary>
  )
}
