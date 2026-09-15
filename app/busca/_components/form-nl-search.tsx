'use client'

import { useState, type KeyboardEvent } from 'react'
import { Button, Group, Kbd, Text, TextInput, Title } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useNlSearch } from '@/services/ai/ai.mutation'
import { notifyError } from '@/lib/utils/notifications'
import { EmptyState } from './empty-state/empty-state'
import { CardSearchResultList } from './card-search-result-list/card-search-result-list'

export function FormNlSearch() {
  const { data: result, isPending, mutate } = useNlSearch()
  const [query, setQuery] = useState<string>('')

  const handleSearch = () => mutate(query, { onError: notifyError('Não consegui buscar') })

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim()) handleSearch()
  }

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div>
        <Title order={3}>Busca em linguagem natural</Title>
        <Text size="sm" c="dimmed">
          Descreva o que procura em texto livre — a IA converte em filtros e aplica sobre suas
          tarefas.
        </Text>
      </div>

      <Group>
        <TextInput
          placeholder="Ex.: consultas de amanhã de alta prioridade"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          rightSection={<Kbd>↵</Kbd>}
        />
        <Button
          leftSection={<IconSearch size={18} />}
          loading={isPending}
          disabled={!query.trim()}
          onClick={handleSearch}
        >
          Buscar
        </Button>
      </Group>

      {result && <CardSearchResultList result={result} />}
      {!result && !isPending && <EmptyState message="Descreva uma busca para começar." />}
    </div>
  )
}
