import { Card, Group, List, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconCircleCheck } from '@tabler/icons-react'
import type { DaySummary } from '@/lib/schemas/insights'
import { SkeletonStack } from '@/components/skeleton-stack/skeleton-stack'

type CardDaySummaryContentProps = {
  summary: DaySummary | undefined
  isPending: boolean
}

export function CardDaySummaryContent({ summary, isPending }: CardDaySummaryContentProps) {
  if (isPending) {
    return (
      <Card withBorder shadow="sm" padding="lg">
        <SkeletonStack rowHeight={14} />
      </Card>
    )
  }

  if (!summary) return null

  return (
    <Card withBorder shadow="sm" padding="lg">
      <Stack gap="md">
        <Text>{summary.summary}</Text>

        <div>
          <Group gap="xs" mb={6}>
            <ThemeIcon variant="light" size="sm" radius="xl">
              <IconCircleCheck size={16} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Foco principal
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {summary.focus}
          </Text>
        </div>

        {summary.suggestedOrder.length > 0 && (
          <div>
            <Text fw={600} size="sm" mb={6}>
              Ordem sugerida
            </Text>
            <List spacing="xs" withPadding>
              {summary.suggestedOrder.map((item) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>
          </div>
        )}
      </Stack>
    </Card>
  )
}
