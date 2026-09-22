import Link from 'next/link'
import { Button, Card, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core'
import { IconClipboardList, IconSearch, IconSettings, IconSparkles } from '@tabler/icons-react'
import { verifySession } from '@/lib/auth/session'
import { paths } from '@/lib/constants/router-paths'

const shortcuts = [
  {
    href: paths.TAREFAS,
    icon: IconClipboardList,
    title: 'Tarefas',
    description: 'Gerencie suas tarefas com tabela, filtros e sugestão de IA.',
    cta: 'Abrir tarefas',
  },
  {
    href: paths.RESUMO,
    icon: IconSparkles,
    title: 'Resumo do dia',
    description: 'A IA organiza suas pendências em um plano de execução.',
    cta: 'Gerar resumo',
  },
  {
    href: paths.BUSCA,
    icon: IconSearch,
    title: 'Busca por IA',
    description: 'Pergunte em linguagem natural e a IA filtra seus dados.',
    cta: 'Fazer uma busca',
  },
]

export default async function DashboardPage() {
  const user = await verifySession()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <Title order={1}>Olá, {user.name.split(' ')[0]} 👋</Title>
        <Text size="lg" c="dimmed">
          Sua central de produtividade com IA. Escolha onde começar.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="transition-shadow hover:shadow-md"
            >
              <Card withBorder shadow="sm" padding="lg" h="100%">
                <ThemeIcon variant="light" size="xl" radius="md" mb="sm">
                  <Icon size={22} />
                </ThemeIcon>
                <Title order={4} mb={6}>
                  {shortcut.title}
                </Title>
                <Text size="sm" c="dimmed" mb="lg">
                  {shortcut.description}
                </Text>
                <Button variant="subtle" size="xs" fullWidth>
                  {shortcut.cta}
                </Button>
              </Card>
            </Link>
          )
        })}
      </SimpleGrid>

      <div>
        <Link href={paths.SETTINGS}>
          <Button variant="light" leftSection={<IconSettings size={18} />}>
            Gerenciar minha conta
          </Button>
        </Link>
      </div>
    </div>
  )
}
