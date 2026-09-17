import Link from 'next/link'
import { Badge, Button, Card, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core'
import { IconClipboardList, IconSearch, IconSparkles, IconStack2 } from '@tabler/icons-react'
import { paths } from '@/lib/constants/router-paths'

const features = [
  {
    href: paths.TAREFAS,
    icon: IconClipboardList,
    title: 'Tarefas',
    description:
      'CRUD completo com tabela, filtros e persistência em SQLite via Next.js API routes.',
    cta: 'Abrir tarefas',
  },
  {
    href: paths.RESUMO,
    icon: IconSparkles,
    title: 'Resumo do dia',
    description:
      'A IA analisa suas tarefas pendentes e devolve um plano: foco sugerido e ordem de execução.',
    cta: 'Gerar resumo',
  },
  {
    href: paths.BUSCA,
    icon: IconSearch,
    title: 'Busca em linguagem natural',
    description:
      'Digite "consultas de amanhã de alta prioridade" e a IA transforma em filtros sobre seus dados.',
    cta: 'Fazer uma busca',
  },
]

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <Badge
          size="lg"
          variant="light"
          leftSection={<IconStack2 size={14} />}
          className="self-start"
        >
          Next 16 · Prisma 7 · GraphQL · IA generativa
        </Badge>
        <Title order={1}>Gerenciador de tarefas que muda o jogo: gestão de tarefas com IA</Title>
        <Text size="lg" c="dimmed" className="max-w-2xl">
          Um produto real de todo list que usa IA no ciclo de vida da tarefa —<b> criar</b>,{' '}
          <b> planejar</b> e <b> encontrar</b>. Backend com uma única camada de negócio servida por
          uma única porta GraphQL (Yoga + Pothos) — usada pela UI e por consumidores externos.
        </Text>
        <div className="flex gap-3">
          <Link href={paths.TAREFAS}>
            <Button leftSection={<IconClipboardList size={18} />} size="md">
              Começar pelas tarefas
            </Button>
          </Link>
          <Link href={paths.RESUMO}>
            <Button variant="light" size="md" leftSection={<IconSparkles size={18} />}>
              Ver resumo do dia
            </Button>
          </Link>
        </div>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="transition-shadow hover:shadow-md"
            >
              <Card withBorder shadow="sm" padding="lg" h="100%">
                <ThemeIcon variant="light" size="xl" radius="md" mb="sm">
                  <Icon size={22} />
                </ThemeIcon>
                <Title order={4} mb={6}>
                  {feature.title}
                </Title>
                <Text size="sm" c="dimmed" mb="lg">
                  {feature.description}
                </Text>
                <Button variant="subtle" size="xs" fullWidth>
                  {feature.cta}
                </Button>
              </Card>
            </Link>
          )
        })}
      </SimpleGrid>

      <SimpleGrid cols={2}>
        <Card withBorder shadow="sm" padding="lg">
          <Title order={5} mb="xs">
            Arquitetura
          </Title>
          <Text size="sm" c="dimmed" component="pre" ff="monospace" m={0}>
            {`UI ──(React Query)──▶ GraphQL ─┐
Consumidor externo ──▶ GraphQL ─┤
                                ▼
          server/modules (controllers + use-cases + repositórios)
                                ▼
              SQLite (Prisma 7 + driver adapter)`}
          </Text>
        </Card>
        <Card withBorder shadow="sm" padding="lg">
          <Title order={5} mb="xs">
            IA de ponta a ponta
          </Title>
          <Text size="sm" c="dimmed">
            Os recursos de IA atuam no ciclo de vida da tarefa e vivem no núcleo de negócio — assim
            UI e consumidores externos falam pela mesma porta GraphQL e a resposta é sempre
            consistente.
          </Text>
        </Card>
      </SimpleGrid>
    </div>
  )
}
