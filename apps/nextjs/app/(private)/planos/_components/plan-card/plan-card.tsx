import type { ReactNode } from 'react'
import { Badge, Button, Card, Group, List, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'

type PlanCardProps = {
  title: string
  price: string
  priceCaption: string
  features: readonly string[]
  ctaLabel: string
  highlighted?: boolean
  badge?: string
  ctaDisabled?: boolean
  ctaLoading?: boolean
  onCta?: () => void
  children?: ReactNode
}

export function PlanCard({
  title,
  price,
  priceCaption,
  features,
  ctaLabel,
  highlighted = false,
  badge,
  ctaDisabled = false,
  ctaLoading = false,
  onCta,
  children,
}: PlanCardProps) {
  return (
    <Card
      withBorder
      shadow={highlighted ? 'md' : 'sm'}
      padding="lg"
      h="100%"
      style={highlighted ? { borderColor: 'var(--color-accent)', borderWidth: 2 } : undefined}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Title order={4}>{title}</Title>
          {badge && (
            <Badge color="primary" variant="light">
              {badge}
            </Badge>
          )}
        </Group>

        {children}

        <div>
          <Text fw={700} size="xl">
            {price}
          </Text>
          <Text size="xs" c="dimmed">
            {priceCaption}
          </Text>
        </div>

        <List
          spacing="xs"
          size="sm"
          icon={
            <ThemeIcon color="primary" size={18} radius="xl">
              <IconCheck size={12} />
            </ThemeIcon>
          }
        >
          {features.map((feature) => (
            <List.Item key={feature}>{feature}</List.Item>
          ))}
        </List>

        <Button
          mt="auto"
          fullWidth
          variant={highlighted ? 'filled' : 'light'}
          disabled={ctaDisabled}
          loading={ctaLoading}
          onClick={onCta}
        >
          {ctaLabel}
        </Button>
      </Stack>
    </Card>
  )
}
