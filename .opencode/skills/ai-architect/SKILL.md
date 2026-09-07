---
name: ai-architect
description: Use when designing or reviewing software architecture, system design, distributed systems, AI/ML pipelines, or technology decisions. Covers architecture styles, ADRs, C4 model, RAG, vector databases, LLM integration, MLOps, and architectural trade-offs. Trigger on keywords like "architecture", "system design", "adr", "c4", "distributed", "microservices", "rag", "vector", "llm", "ai pipeline", "mlops", "trade-off", "scalability", "architect".
---

# AI Architect — Arquitetura de Software + IA/ML

Referência completa para decisões de arquitetura de software e soluções de IA/ML. O arquiteto é o primeiro passo do fluxo de desenvolvimento — define a direção antes da implementação.

---

## Parte 1: Arquitetura de Software

### Estilos Arquiteturais

#### Modular Monolith

**Quando usar:** Projetos em fase inicial, equipes pequenas, monolito com boundaries claros.

```
src/
├── modules/
│   ├── user/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── index.ts          # barrel export (boundary)
│   ├── order/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── index.ts
│   └── shared/
│       ├── kernel/            # shared kernel
│       └── events/
└── bootstrap.ts
```

```ts
// modules/user/index.ts — boundary control
export { CreateUserUseCase } from './application/create-user'
export type { UserRepository } from './domain/repository'
// NUNCA exporta internals (implementações, entidades internas)

// modules/order/application/create-order.ts
import { CreateUserUseCase } from '@mod/user' // ✅ via barrel
import { PrismaUserRepository } from '@mod/user/infra' // ❌ forbidden
```

**Regras:**

- Módulos não importam internals de outros módulos
- Comunicação cross-module via eventos ou interfaces compartilhadas
- Shared kernel é mínimo (tipos, erros base, eventos)

#### Microservices

**Quando usar:** Equipes grandes, deploys independentes, escala diferenciada por bounded context.

```ts
// Cada serviço é um deploy independente
services/
├── user-service/          # CRUD users, auth
├── order-service/         # Pedidos, saga orchestrator
├── payment-service/       # Pagamentos, webhook handler
├── notification-service   # Email, push, SMS
└── gateway/               # API Gateway (routing, auth, rate limit)
```

**Padrões essenciais:**

- API Gateway para roteamento e autenticação
- Service Discovery (consul, k8s dns)
- Circuit Breaker em chamadas inter-service
- Saga Pattern para transações distribuídas
- Event-driven para desacoplamento

#### Serverless / Edge

**Quando usar:** APIs com tráfego variado, processamento de eventos, compute pontual.

```ts
// api/users/create.ts — AWS Lambda / Vercel Function
export async function POST(request: Request) {
  const body = await request.json()
  const user = await createUser(body)
  return Response.json(user, { status: 201 })
}
```

**Trade-offs:**

- ✅ Zero infra para gerenciar, escala automática
- ✅ Custo por execução (paga só o usa)
- ❌ Cold starts, debugging difícil
- ❌ Lock-in do provider

#### Event-Driven Architecture

**Quando usar:** Sistemas reativos, audit trail, desacoplamento entre domínios.

```ts
// Publisher
class OrderCreatedEvent {
  type = 'order.created' as const
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly total: number,
  ) {}
}

// Subscriber
class SendOrderConfirmation {
  async handle(event: OrderCreatedEvent): Promise<void> {
    await this.emailSender.send(event.userId, 'Pedido confirmado!')
  }
}
```

**Ferramentas:** Kafka (high throughput), RabbitMQ (flexível), Redis Streams (simples), AWS EventBridge (serverless).

---

### Padrões de Sistemas Distribuídos

#### Saga Pattern

**Orquestração vs Coreografia:**

```ts
// Orquestração — centralizado
class OrderSaga {
  private steps = [
    { execute: () => this.reserveInventory(), compensate: () => this.releaseInventory() },
    { execute: () => this.processPayment(), compensate: () => this.refundPayment() },
    { execute: () => () => this.shipOrder(), compensate: () => this.cancelShipping() },
  ]

  async run(order: Order): Promise<void> {
    const completed: number[] = []
    try {
      for (let i = 0; i < this.steps.length; i++) {
        await this.steps[i].execute()
        completed.push(i)
      }
    } catch {
      for (const i of completed.reverse()) {
        await this.steps[i].compensate()
      }
      throw new SagaFailedError()
    }
  }
}
```

#### CQRS + Event Sourcing

```ts
// Command side — escreve eventos
class PlaceOrderCommand {
  async execute(input: PlaceOrderInput): Promise<void> {
    const order = Order.create(input)
    await this.eventStore.append('order.created', {
      orderId: order.id,
      items: order.items,
      total: order.total,
    })
  }
}

// Query side — lê projeções otimizadas
class OrderQueryService {
  async findById(id: string): Promise<OrderView | null> {
    return this.readModel.findById(id) // projeção pré-computada
  }

  async findByUser(userId: string): Promise<OrderView[]> {
    return this.readModel.findByUser(userId) // índice otimizado
  }
}
```

#### Circuit Breaker

```ts
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private failureCount = 0
  private lastFailure = 0

  constructor(
    private readonly threshold: number = 5,
    private readonly resetTimeout: number = 30000,
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open'
      } else {
        throw new CircuitOpenError()
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    this.state = 'closed'
  }

  private onFailure() {
    this.failureCount++
    this.lastFailure = Date.now()
    if (this.failureCount >= this.threshold) {
      this.state = 'open'
    }
  }
}
```

#### Outbox Pattern (idempotência)

```ts
// Transactional Outbox — garante entrega de eventos
async function placeOrder(input: PlaceOrderInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: input })
    await tx.outbox.create({
      data: {
        aggregateType: 'Order',
        aggregateId: order.id,
        eventType: 'order.created',
        payload: JSON.stringify(order),
      },
    })
  })
}

// Polling publisher — consome outbox e publica eventos
setInterval(async () => {
  const events = await prisma.outbox.findMany({
    where: { processed: false },
    orderBy: { createdAt: 'asc' },
  })
  for (const event of events) {
    await eventBus.publish(event.eventType, JSON.parse(event.payload))
    await prisma.outbox.update({ where: { id: event.id }, data: { processed: true } })
  }
}, 1000)
```

---

### API Design

#### REST Conventions

```ts
// Recursos e métodos
GET    /api/users          → lista (com paginação)
GET    /api/users/:id      → detalhe
POST   /api/users          → cria
PATCH  /api/users/:id      → atualiza parcial
DELETE /api/users/:id      → remove

// Filtros via query params
GET /api/orders?status=pending&userId=123&sort=-createdAt&limit=20

// Response envelope
{
  "data": [...],
  "meta": { "total": 150, "page": 1, "limit": 20 },
  "links": { "next": "/api/orders?page=2", "prev": null }
}

// Erros padronizados
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "rule": "required" }]
  }
}
```

#### GraphQL Schema Design

```ts
// Schema com connections (relay-style pagination)
type User {
  id: ID!
  name: String!
  email: String!
  orders(first: Int, after: String): OrderConnection!
}

type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type OrderEdge {
  node: Order!
  cursor: String!
}

// Resolver com DataLoader para N+1
const userResolvers = {
  User: {
    orders: async (parent, args, ctx) => {
      return ctx.loaders.orderByUser.load({ userId: parent.id, ...args })
    },
  },
}
```

#### Error Handling Architecture

```ts
// Camada de erros organizada
// domain/errors/
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
  }
}

class UserNotFoundError extends DomainError {
  constructor(id: string) {
    super(`User ${id} not found`, 'USER_NOT_FOUND')
  }
}

// infrastructure/http/error-handler.ts
function errorHandler(error: unknown): Response {
  if (error instanceof DomainError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: mapCodeToStatus(error.code) },
    )
  }
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
    { status: 500 },
  )
}

function mapCodeToStatus(code: string): number {
  const map: Record<string, number> = {
    USER_NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  }
  return map[code] ?? 500
}
```

---

### Frontend Architecture

#### Micro-Frontends

```ts
// Module Federation (Webpack 5 / Vite)
// host/webpack.config.ts
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
    settings: 'settings@http://localhost:3002/remoteEntry.js',
  },
})

// Comunicação via Custom Events
window.dispatchEvent(
  new CustomEvent('mfe:user-selected', {
    detail: { userId: '123' },
  }),
)
```

#### Component Architecture (Feature-Based)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── auth-api.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── shared/
│       ├── components/    # UI kit compartilhado
│       ├── hooks/
│       └── utils/
└── app/
    ├── layout.tsx
    └── providers.tsx
```

#### State Management Architecture

```ts
// Server State (React Query / SWR)
// Dados do servidor = cache invalidável
function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

// Client State (Zustand / Jotai)
// Estado local da UI
const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// Form State (React Hook Form)
// Estado de formulários
const form = useForm<RegisterInput>({
  resolver: zodResolver(registerSchema),
})
```

---

### Architecture Decision Records (ADR)

```markdown
# ADR-001: Usar PostgreSQL como banco principal

## Status

Aceito

## Contexto

Precisamos de um banco relacional que suporte JSON, full-text search e timescale.

## Decisão

PostgreSQL como banco principal do sistema.

## Consequências

- ✅ Suporte nativo a JSONB (flexibilidade)
- ✅ Full-text search sem Elasticsearch
- ✅ TimescaleDB para séries temporais
- ❌ Mais complexo que SQLite para dev local
- ❌ Necessita DBA para otimização em escala

## Alternativas avaliadas

- MySQL: menos features JSON
- MongoDB: sem transações ACID confiáveis
```

**Estrutura de diretório para ADRs:**

```
docs/
├── adr/
│   ├── 001-usar-postgres.md
│   ├── 002-api-graphql.md
│   └── template.md
└── architecture.md
```

---

### C4 Model — Documentação de Arquitetura

```
Level 1: Context Diagram
  → Sistema como caixa preta, atores externos
  → "O sistema X se comunica com o usuário e o gateway de pagamento"

Level 2: Container Diagram
  → Internos do sistema: web app, API, banco, queues
  → "Web App (React) → API (Node) → PostgreSQL"

Level 3: Component Diagram
  → Internos de um container: módulos, services, repositórios
  → "API contém: AuthModule, UserModule, OrderModule"

Level 4: Code Diagram
  → Classes e relações (opcional, para partes críticas)
  → "UserEntity → UserRepository → PrismaUserRepository"
```

---

### Scalability Patterns

#### Read Replica + Write Primary

```ts
// Write operations → primary
const writeDb = new PrismaClient({ datasources: { db: { url: PRIMARY_URL } } })

// Read operations → replicas
const readDb = new PrismaClient({ datasources: { db: { url: REPLICA_URL } } })

// Repository pattern abstrai isso
class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await writeDb.user.upsert({/* ... */}) // write
  }
  async findById(id: string): Promise<User | null> {
    return readDb.user.findUnique({ where: { id } }) // read
  }
}
```

#### Cache Strategy

```ts
// Cache-Aside Pattern
class CachedUserRepository implements UserRepository {
  constructor(
    private readonly db: UserRepository,
    private readonly cache: Cache,
  ) {}

  async findById(id: string): Promise<User | null> {
    const cached = await this.cache.get<User>(`user:${id}`)
    if (cached) return cached

    const user = await this.db.findById(id)
    if (user) await this.cache.set(`user:${id}`, user, { ttl: 300 })
    return user
  }

  async save(user: User): Promise<void> {
    await this.db.save(user)
    await this.cache.invalidate(`user:${user.id}`)
  }
}
```

---

## Parte 2: IA/ML Architecture

### RAG (Retrieval-Augmented Generation)

#### Arquitetura Básica

```
User Query
    │
    ▼
┌─────────────┐
│  Embedding   │  Texto → Vetor (OpenAI, Cohere, local)
│  Model       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vector     │  Busca top-k vetores similares
│   Database   │  (Pinecone, Weaviate, pgvector, Qdrant)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Context     │  Documentos relevantes + query original
│  Builder     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LLM       │  Gera resposta com contexto enriquecido
│  (GPT, etc)  │
└──────┬──────┘
       │
       ▼
   Resposta
```

#### Pipeline Completo

```ts
// Document Processing Pipeline
interface DocumentProcessor {
  chunk(document: RawDocument): Chunk[]
  embed(chunks: Chunk[]): Embedding[]
  store(embeddings: Embedding[]): Promise<void>
}

class RAGPipeline implements DocumentProcessor {
  constructor(
    private readonly chunker: TextChunker,
    private readonly embedder: EmbeddingModel,
    private readonly vectorStore: VectorStore,
  ) {}

  async ingest(documents: RawDocument[]): Promise<void> {
    for (const doc of documents) {
      const chunks = this.chunker.chunk(doc, {
        chunkSize: 512,
        overlap: 50,
        strategy: 'recursive', // ou "semantic", "fixed"
      })
      const embeddings = await this.embedder.embed(chunks)
      await this.vectorStore.upsert(embeddings)
    }
  }

  async query(question: string, topK = 5): Promise<string> {
    const queryEmbedding = await this.embedder.embedOne(question)
    const results = await this.vectorStore.search(queryEmbedding, topK)

    const context = results.map((r) => r.text).join('\n\n')
    return this.llm.complete({
      system:
        'Responda com base no contexto fornecido. Se não souber, diga que não tem informação.',
      messages: [{ role: 'user', content: `Contexto:\n${context}\n\nPergunta: ${question}` }],
    })
  }
}
```

#### Chunking Strategies

```ts
// Fixed-size chunking
class FixedChunker implements TextChunker {
  chunk(doc: RawDocument, options: ChunkOptions): Chunk[] {
    const words = doc.content.split(' ')
    const chunks: Chunk[] = []
    for (let i = 0; i < words.length; i += options.chunkSize) {
      chunks.push({
        text: words.slice(i, i + options.chunkSize).join(' '),
        metadata: { source: doc.source, chunkIndex: chunks.length },
      })
    }
    return chunks
  }
}

// Semantic chunking (baseado em embeddings)
class SemanticChunker implements TextChunker {
  async chunk(doc: RawDocument): Promise<Chunk[]> {
    const sentences = splitSentences(doc.content)
    const embeddings = await this.embedder.embed(sentences)
    // Agrupar sentenças com alta similaridade
    return clusterBySimilarity(sentences, embeddings, (threshold = 0.7))
  }
}

// Recursive chunking (respeita estrutura)
class RecursiveChunker implements TextChunker {
  private separators = ['\n\n', '\n', '. ', ' ']

  chunk(doc: RawDocument, options: ChunkOptions): Chunk[] {
    return this.splitRecursive(doc.content, options.chunkSize, 0)
  }

  private splitRecursive(text: string, maxSize: number, depth: number): Chunk[] {
    if (text.length <= maxSize) return [{ text, metadata: {} }]
    const sep = this.separators[depth] ?? ' '
    const parts = text.split(sep)
    // ... agrupar partes respeitando maxSize
  }
}
```

---

### Vector Databases

#### Comparativo

| Database        | Tipo        | Performance | Filtro          | Escala     |
| --------------- | ----------- | ----------- | --------------- | ---------- |
| **pgvector**    | Extensão PG | Média       | SQL WHERE       | Vertical   |
| **Pinecone**    | Managed     | Alta        | Metadata filter | Horizontal |
| **Qdrant**      | Self-hosted | Alta        | Payload filter  | Horizontal |
| **Weaviate**    | Self-hosted | Alta        | GraphQL filter  | Horizontal |
| **Chroma**      | Local/Light | Média       | Where clause    | Limitada   |
| **Redis Stack** | In-memory   | Muito alta  | Tag filter      | Vertical   |

#### pgvector (recomendado para começar)

```sql
-- Migration
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,  -- OpenAI ada-002
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca相似
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Query de busca
SELECT content, metadata,
       1 - (embedding <=> $1) AS similarity
FROM documents
WHERE 1 - (embedding <=> $1) > 0.7  -- threshold
ORDER BY embedding <=> $1
LIMIT 5;
```

```ts
// Repository para pgvector
class PgVectorStore implements VectorStore {
  constructor(private readonly db: PrismaClient) {}

  async search(query: number[], topK: number): Promise<VectorResult[]> {
    return this.db.$queryRaw`
      SELECT id, content, metadata,
             1 - (embedding <=> ${query}::vector) AS similarity
      FROM documents
      ORDER BY embedding <=> ${query}::vector
      LIMIT ${topK}
    `
  }

  async upsert(embeddings: Embedding[]): Promise<void> {
    for (const emb of embeddings) {
      await this.db.$executeRaw`
        INSERT INTO documents (id, content, embedding, metadata)
        VALUES (${emb.id}::uuid, ${emb.text}, ${emb.vector}::vector, ${emb.metadata}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata
      `
    }
  }
}
```

---

### Embedding Models

| Model                             | Dimensões | Custo  | Qualidade | Uso            |
| --------------------------------- | --------- | ------ | --------- | -------------- |
| `text-embedding-3-small` (OpenAI) | 1536      | Baixo  | Boa       | Geral          |
| `text-embedding-3-large` (OpenAI) | 3072      | Médio  | Excelente | Alta qualidade |
| `embed-v3` (Cohere)               | 1024      | Médio  | Excelente | Multilingual   |
| `bge-m3` (BAAI)                   | 1024      | Grátis | Boa       | Self-hosted    |
| `nomic-embed-text` (local)        | 768       | Grátis | Média     | Local/edge     |

```ts
// Interface unificada
interface EmbeddingModel {
  embed(chunks: Chunk[]): Promise<Embedding[]>
  embedOne(text: string): Promise<number[]>
  dimensions: number
}

class OpenAIEmbedding implements EmbeddingModel {
  dimensions = 1536

  constructor(private readonly model = 'text-embedding-3-small') {}

  async embed(chunks: Chunk[]): Promise<Embedding[]> {
    const response = await openai.embeddings.create({
      model: this.model,
      input: chunks.map((c) => c.text),
    })
    return response.data.map((item, i) => ({
      id: chunks[i].metadata.id ?? crypto.randomUUID(),
      text: chunks[i].text,
      vector: item.embedding,
      metadata: chunks[i].metadata,
    }))
  }

  async embedOne(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: this.model,
      input: text,
    })
    return response.data[0].embedding
  }
}
```

---

### LLM Integration Patterns

#### Structured Output

```ts
// Usando Zod + OpenAI para output estruturado
import { z } from 'zod'
import { zodFunction } from 'openai/helpers/zod'

const AnalysisSchema = z.object({
  summary: z.string().describe('Resumo em 1-2 frases'),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  keyTopics: z.array(z.string()).describe('Top 3 tópicos'),
  confidence: z.number().min(0).max(1),
})

async function analyzeText(text: string): Promise<AnalysisResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: text }],
    response_format: zodResponseFormat(AnalysisSchema, 'analysis'),
  })
  return AnalysisSchema.parse(JSON.parse(response.choices[0].message.content))
}
```

#### Streaming

```ts
// Streaming com processamento incremental
async function* streamAnalysis(text: string): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: text }],
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

// Usando no Next.js Route Handler
export async function POST(req: Request) {
  const { text } = await req.json()
  const stream = streamAnalysis(text)

  return new Response(readableStreamFrom(stream), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

#### Prompt Engineering Patterns

```ts
// System prompt com role e restrições
const SYSTEM_PROMPT = `
Você é um analisador de documentos jurídicos.

## Regras
1. Responda SOMENTE com base no documento fornecido
2. Se a informação não estiver no documento, diga "Não encontrado no documento"
3. Cite trechos relevantes entre aspas
4. Formate datas no padrão brasileiro

## Formato de resposta
{
  "answer": "string",
  "citations": ["trecho1", "trecho2"],
  "confidence": number
}
`

// Few-shot examples
const FEW_SHOT = `
## Exemplos

Documento: "O contrato vigorará por 12 meses a partir da assinatura."
Pergunta: "Qual a duração do contrato?"
Resposta: {
  "answer": "O contrato tem duração de 12 meses",
  "citations": ["O contrato vigorará por 12 meses"],
  "confidence": 0.95
}

Documento: "O pagamento será realizado em 30 dias."
Pergunta: "Tem multa por atraso?"
Resposta: {
  "answer": "Não encontrado no documento",
  "citations": [],
  "confidence": 0.9
}
`
```

---

### AI Agents Architecture

#### ReAct Pattern (Reasoning + Acting)

```ts
interface AgentStep {
  thought: string
  action: string
  actionInput: Record<string, unknown>
  observation?: string
}

class ReActAgent {
  constructor(
    private readonly llm: LLM,
    private readonly tools: Tool[],
  ) {}

  async run(query: string): Promise<string> {
    const steps: AgentStep[] = []
    const maxIterations = 10

    for (let i = 0; i < maxIterations; i++) {
      const step = await this.llm.complete({
        system: REACT_PROMPT,
        messages: [
          { role: 'user', content: `Query: ${query}\n\nSteps so far:\n${formatSteps(steps)}` },
        ],
      })

      const parsed = parseStep(step)
      if (parsed.action === 'finish') return parsed.actionInput.answer

      const result = await this.executeTool(parsed.action, parsed.actionInput)
      parsed.observation = result
      steps.push(parsed)
    }

    return 'Max iterations reached'
  }

  private async executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    const tool = this.tools.find((t) => t.name === name)
    if (!tool) throw new Error(`Tool ${name} not found`)
    return tool.execute(input)
  }
}
```

#### Multi-Agent Orchestration

```ts
// Supervisor que delega para agents especializados
class AgentOrchestrator {
  private agents = new Map<string, Agent>()

  register(name: string, agent: Agent): void {
    this.agents.set(name, agent)
  }

  async route(query: string): Promise<string> {
    // Supervisor decide qual agent usar
    const routing = await this.supervisorLLM.complete({
      system: `Decida qual agent deve responder. Agents disponíveis: ${[...this.agents.keys()].join(', ')}`,
      messages: [{ role: 'user', content: query }],
    })

    const agentName = parseRouting(routing)
    const agent = this.agents.get(agentName)
    if (!agent) throw new Error(`Unknown agent: ${agentName}`)

    return agent.run(query)
  }
}
```

---

### MLOps & Model Serving

#### Model Registry + Versioning

```ts
interface ModelVersion {
  modelId: string
  version: string
  artifact: string // path to model file
  metrics: Record<string, number>
  createdAt: Date
  status: 'staging' | 'production' | 'archived'
}

class ModelRegistry {
  async promote(modelId: string, version: string): Promise<void> {
    // Desativar versão atual
    await this.db.updateMany({
      where: { modelId, status: 'production' },
      data: { status: 'archived' },
    })
    // Promover nova versão
    await this.db.update({
      where: { modelId_version: { modelId, version } },
      data: { status: 'production' },
    })
  }
}
```

#### Evaluation Pipeline

```ts
interface EvalResult {
  modelId: string
  version: string
  metrics: {
    accuracy: number
    f1Score: number
    latencyP95: number
    costPerToken: number
  }
  evaluatedAt: Date
}

class ModelEvaluator {
  async evaluate(modelId: string, dataset: EvalDataset): Promise<EvalResult> {
    const model = await this.loadModel(modelId)
    const predictions = []

    for (const sample of dataset.samples) {
      const start = Date.now()
      const prediction = await model.predict(sample.input)
      predictions.push({
        expected: sample.expected,
        predicted: prediction,
        latency: Date.now() - start,
      })
    }

    return {
      modelId,
      version: model.version,
      metrics: this.computeMetrics(predictions),
      evaluatedAt: new Date(),
    }
  }
}
```

#### Prompt Versioning

```ts
interface PromptVersion {
  id: string
  name: string
  template: string
  variables: string[]
  model: string
  version: string
  evalScore?: number
}

class PromptManager {
  async deploy(promptId: string, version: string): Promise<void> {
    await this.db.promptVersion.updateMany({
      where: { promptId, status: 'active' },
      data: { status: 'inactive' },
    })
    await this.db.promptVersion.update({
      where: { id: `${promptId}:${version}` },
      data: { status: 'active' },
    })
  }

  async getActive(promptName: string): Promise<PromptVersion> {
    return this.db.promptVersion.findFirst({
      where: { name: promptName, status: 'active' },
    })
  }
}
```

---

## Regras Gerais

### Arquitetura de Software

1. **Defina o estilo antes de implementar** — monolito modular vs microservices tem implicações enormes
2. **Use ADRs** — documente decisões importantes com contexto e trade-offs
3. **Boundaries claros** — modules não devem vazar internals
4. **Fail fast** — erros devem ser detectados cedo (validation, type safety)
5. **Observe antes de escalar** — não otimize sem métricas
6. **Prefira monotrilho no início** — migre para microservices quando a dor justificar
7. **Testes de integração > mocks** — confie menos em mocks, mais em testes reais

### IA/ML

1. **RAG primeiro** — fine-tuning é caro; tente RAG antes
2. **Chunking importa** — a qualidade do chunking define a qualidade da resposta
3. **Eval é obrigatório** — não deploye modelo sem métricas
4. **Cache agressivamente** — LLM calls são lentas e caras
5. **Versione prompts** — trate prompts como código
6. **Use structured output** — Zod schemas evitam respostas inválidas
7. **Monitorie custos** — LLM APIs têm custo variável; tracke por feature
8. **Human-in-the-loop** — para decisões críticas, sempre inclua revisão humana
9. **Idempotência** — reprocessamentos são comuns; garanta que re-rodar é seguro

### Trade-offs

1. **Consistência vs Disponibilidade** (CAP theorem)
2. **Simplicidade vs Flexibilidade** (monolito vs microservices)
3. **Custo vs Performance** (managed vs self-hosted)
4. **Velocidade vs Qualidade** (RAG vs fine-tuning)
5. **Custo vs Latência** (GPU local vs API cloud)
