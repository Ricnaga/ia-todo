'use client'

import { Group, Text, UnstyledButton } from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react'
import type { Column } from '@tanstack/react-table'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { todoTableFeatures } from '../table-todo-list/todo-table-features'

type TableSortHeaderProps<TValue> = {
  column: Column<typeof todoTableFeatures, Todo, TValue>
  label: string
}

export function TableSortHeader<TValue>({ column, label }: TableSortHeaderProps<TValue>) {
  const sorted = column.getIsSorted()

  return (
    <UnstyledButton onClick={column.getToggleSortingHandler()}>
      <Group gap={4} wrap="nowrap">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {sorted === 'asc' && <IconArrowUp size={14} />}
        {sorted === 'desc' && <IconArrowDown size={14} />}
        {!sorted && <IconArrowsSort size={14} opacity={0.4} />}
      </Group>
    </UnstyledButton>
  )
}
