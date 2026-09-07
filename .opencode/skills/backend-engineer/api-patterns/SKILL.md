---
name: api-patterns
description: Use when building APIs, endpoints, services, authentication, error handling, rate limiting, caching, background jobs, or any service-layer patterns. Covers REST conventions, auth (JWT, OAuth, RBAC), error hierarchies, rate limiting, caching, queues, webhooks, and API security. Trigger on keywords like "api", "endpoint", "rest", "auth", "jwt", "oauth", "rbac", "rate limit", "cache", "queue", "job", "webhook", "middleware", "database", "migration", "transaction".
---

# Backend API Patterns

Referência completa para desenvolvimento de APIs backend com Node/TypeScript. Complementa as skills de arquitetura (clean-architecture, hexagonal) com padrões específicos de backend.

---

## REST API Patterns

### Route Organization

```ts
// src/modules/user/user.routes.ts
import { Router } from 'express'
import { authenticate } from '@/shared/middleware/auth'
import { validate } from '@/shared/middleware/validate'
import { createUserSchema, updateUserSchema } from './user.schema'

export function userRoutes(router: Router) {
  const controller = new UserController()

  router.get('/users', authenticate(), controller.list)
  router.get('/users/:id', authenticate(), controller.getById)
  router.post('/users', authenticate(), validate(createUserSchema), controller.create)
  router.patch('/users/:id', authenticate(), validate(updateUserSchema), controller.update)
  router.delete('/users/:id', authenticate(), controller.delete)
  router.post('/users/:id/activate', authenticate(), controller.activate)
  router.post('/users/:id/deactivate', authenticate(), controller.deactivate)

  return router
}
```

### Pagination

```ts
// Offset-based (simples, mas lento em large datasets)
interface OffsetPagination {
  page: number // default: 1
  limit: number // default: 20, max: 100
}

// Cursor-based (recomendado para infinite scroll)
interface CursorPagination {
  cursor?: string // id do ultimo item
  limit: number // default: 20, max: 100
  direction?: 'forward' | 'backward'
}

// Response padrao
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  links: {
    self: string
    next: string | null
    previous: string | null
    first: string
    last: string
  }
}

// Repository com paginacao
class UserRepository {
  async findMany(params: FindManyParams): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 20, filters, sort } = params
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: sort,
      }),
      prisma.user.count({ where: filters }),
    ])

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
      links: buildPaginationLinks(page, limit, total),
    }
  }
}
```

### Filtering & Sorting

```ts
// Query params padrao
// GET /api/users?status=active&role=admin&sort=-createdAt,name&search=joao

interface ListParams {
  search?: string
  sort?: string // "-createdAt" = desc, "name" = asc
  filters?: Record<string, string | string[]>
  page?: number
  limit?: number
}

// Parse do sort param
function parseSort(sort?: string): Record<string, 'asc' | 'desc'> {
  if (!sort) return { createdAt: 'desc' }
  return Object.fromEntries(
    sort.split(',').map((field) => {
      const desc = field.startsWith('-')
      return [desc ? field.slice(1) : field, desc ? 'desc' : 'asc']
    }),
  )
}

// Filtros dinamicos
function buildFilters(query: Record<string, unknown>): Prisma.UserWhereInput {
  const filters: Prisma.UserWhereInput = {}

  if (query.status) filters.status = query.status as Status
  if (query.role) filters.role = query.role as Role
  if (query.search) {
    filters.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  if (query.createdAfter) {
    filters.createdAt = { gte: new Date(query.createdAfter as string) }
  }

  return filters
}
```

---

## Authentication & Authorization

### JWT Pattern

```ts
// Token generation
interface TokenPayload {
  sub: string // user id
  email: string
  role: Role
  iat?: number
  exp?: number
}

function generateTokens(user: User): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' },
  )

  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  })

  return { accessToken, refreshToken }
}

// Middleware de autenticacao
function authenticate() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Token required' })

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
      req.user = payload
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

// Refresh token flow
async function refreshTokens(refreshToken: string): Promise<Tokens> {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string }
    const user = await userRepo.findById(payload.sub)
    if (!user) throw new Error('User not found')
    return generateTokens(user)
  } catch {
    throw new UnauthorizedError('Invalid refresh token')
  }
}
```

### RBAC (Role-Based Access Control)

```ts
type Role = 'admin' | 'manager' | 'user'

interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  manager: [
    { resource: 'users', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    { resource: 'reports', action: 'read' },
  ],
  user: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
  ],
}

function authorize(resource: string, action: Permission['action']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role
    const permissions = rolePermissions[userRole] ?? []

    const hasPermission = permissions.some(
      (p) => (p.resource === '*' || p.resource === resource) && p.action === action,
    )

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

// Uso
router.delete('/users/:id', authenticate(), authorize('users', 'delete'), controller.delete)
```

### OAuth2 / OIDC

```ts
// Integracao com provider externo (Google, GitHub, etc.)
interface OAuthProfile {
  provider: 'google' | 'github'
  providerId: string
  email: string
  name: string
  avatar?: string
}

async function handleOAuthCallback(profile: OAuthProfile): Promise<User> {
  // Buscar usuario existente
  let user = await userRepo.findByProvider(profile.provider, profile.providerId)

  if (!user) {
    // Verificar se email ja existe
    user = await userRepo.findByEmail(profile.email)
    if (user) {
      // Vincular conta OAuth
      await userRepo.linkProvider(user.id, profile)
    } else {
      // Criar novo usuario
      user = await userRepo.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        provider: profile.provider,
        providerId: profile.providerId,
      })
    }
  }

  return user
}
```

---

## Error Handling

### Error Classes

```ts
// hierarchy de erros
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` ${id}` : ''} not found`, 'NOT_FOUND', 404)
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422)
    this.details = details
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Too many requests', 'RATE_LIMITED', 429)
    this.retryAfter = retryAfter
  }
}
```

### Global Error Handler

```ts
// middleware/error-handler.ts
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // App errors (operational)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { details: err.details }),
        ...(err instanceof RateLimitError && { retryAfter: err.retryAfter }),
      },
    })
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    })
  }

  // Unexpected errors
  console.error('Unhandled error:', err)
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
```

---

## Database Patterns

### Migration Pattern

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### Transaction Pattern

```ts
// Service com transacao
class OrderService {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      // 1. Validar estoque
      const items = await tx.inventory.findMany({
        where: { productId: { in: input.items.map((i) => i.productId) } },
      })

      for (const item of input.items) {
        const stock = items.find((i) => i.productId === item.productId)
        if (!stock || stock.quantity < item.quantity) {
          throw new ValidationError(`Insufficient stock for product ${item.productId}`)
        }
      }

      // 2. Criar pedido
      const order = await tx.order.create({
        data: {
          userId: input.userId,
          items: { create: input.items },
          total: calculateTotal(input.items),
        },
      })

      // 3. Decrementar estoque
      for (const item of input.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        })
      }

      // 4. Publicar evento (fora da transacao, via outbox)
      await tx.outbox.create({
        data: {
          eventType: 'order.created',
          aggregateType: 'Order',
          aggregateId: order.id,
          payload: JSON.stringify(order),
        },
      })

      return order
    })
  }
}
```

### Optimistic Locking

```ts
// Evitar lost updates em concorrencia
async function updateUser(
  id: string,
  input: UpdateUserInput,
  expectedVersion: number,
): Promise<User> {
  const result = await prisma.user.updateMany({
    where: { id, version: expectedVersion },
    data: {
      ...input,
      version: expectedVersion + 1,
    },
  })

  if (result.count === 0) {
    throw new ConflictError('User was modified by another request. Please refresh and try again.')
  }

  return prisma.user.findUnique({ where: { id } })
}
```

---

## Rate Limiting

```ts
// Rate limiter com Redis
import Redis from 'ioredis'

const redis = new Redis()

async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const windowStart = now - windowMs

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart) // remover janelas antigas
  pipeline.zadd(key, now, `${now}`) // adicionar request atual
  pipeline.zcard(key) // contar requests na janela
  pipeline.pexpire(key, windowMs) // TTL da janela
  const results = await pipeline.exec()

  const count = results[1][1] as number
  const allowed = count <= limit
  const resetAt = now + windowMs

  return { allowed, remaining: Math.max(0, limit - count), resetAt }
}

// Middleware
function rateLimitMiddleware(limit = 100, windowMs = 60000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}:${req.route.path}`
    const { allowed, remaining, resetAt } = await rateLimit(key, limit, windowMs)

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000))

    if (!allowed) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
        },
      })
    }
    next()
  }
}
```

---

## Caching

```ts
// Cache-Aside com Redis
class CacheService {
  constructor(
    private readonly redis: Redis,
    private readonly defaultTTL = 300,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.setex(key, ttl ?? this.defaultTTL, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length) await this.redis.del(...keys)
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    await this.invalidate(`${prefix}:*`)
  }
}

// Usage em repository
class CachedProductRepository implements ProductRepository {
  constructor(
    private readonly db: ProductRepository,
    private readonly cache: CacheService,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`
    const cached = await this.cache.get<Product>(cacheKey)
    if (cached) return cached

    const product = await this.db.findById(id)
    if (product) await this.cache.set(cacheKey, product, 600)
    return product
  }

  async save(product: Product): Promise<void> {
    await this.db.save(product)
    await this.cache.invalidate(`product:${product.id}`)
    await this.cache.invalidatePrefix('products:list')
  }
}
```

---

## Background Jobs

```ts
// BullMQ pattern
import { Queue, Worker } from 'bullmq'

// Definir fila
const emailQueue = new Queue('emails', { connection: redis })

// Enfileirar job
async function sendWelcomeEmail(user: User): Promise<void> {
  await emailQueue.add(
    'welcome',
    {
      to: user.email,
      name: user.name,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  )
}

// Processar jobs
const emailWorker = new Worker(
  'emails',
  async (job) => {
    switch (job.name) {
      case 'welcome':
        await sendEmail(job.data.to, 'Bem-vindo!', `Olá ${job.data.name}!`)
        break
      case 'reset-password':
        await sendEmail(job.data.to, 'Resetar senha', `Clique aqui: ${job.data.link}`)
        break
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
)

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

// Delayed jobs (agendar para o futuro)
await emailQueue.add(
  'reminder',
  { userId: user.id },
  {
    delay: 24 * 60 * 60 * 1000, // 24 horas
  },
)
```

---

## Webhooks

```ts
// Webhook delivery com retry
interface WebhookEvent {
  id: string
  type: string
  payload: unknown
  createdAt: Date
}

class WebhookService {
  async deliver(event: WebhookEvent): Promise<void> {
    const subscriptions = await this.getSubscriptions(event.type)

    for (const sub of subscriptions) {
      await this.sendWithRetry(sub, event)
    }
  }

  private async sendWithRetry(sub: Subscription, event: WebhookEvent): Promise<void> {
    const body = JSON.stringify(event)
    const signature = createHmac('sha256', sub.secret).update(body).digest('hex')

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Event': event.type,
            'X-Webhook-ID': event.id,
          },
          body,
        })

        if (response.ok) return

        // 4xx = nao retry (exceto 408, 429)
        if (
          response.status >= 400 &&
          response.status < 500 &&
          ![408, 429].includes(response.status)
        ) {
          console.error(`Webhook ${sub.id} failed with ${response.status}, not retrying`)
          return
        }
      } catch (error) {
        // Network error = retry
      }

      // Backoff exponencial
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
    }

    // Marcar como falha after 3 tentativas
    await this.markFailed(sub.id, event.id)
  }
}

// Verificacao de assinatura (consumidor)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expected}`))
}
```

---

## API Security Headers

```ts
// helmet.js ou manual
function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
}
```

---

## Regras

1. **REST conventions** — verbos HTTP corretos, recursos no plural
2. **Autenticacao sempre** — JWT com refresh token, tokens curtos (15min)
3. **RBAC granular** — resource + action, nao so role
4. **Tratamento de erros** — AppError hierarchy, error handler global
5. **Transacoes** — usar $transaction do Prisma para operacoes atômicas
6. **Rate limiting** — sempre, especialmente em auth endpoints
7. **Cache invalidation** — invalidar no write, TTL no read
8. **Background jobs** — filas para operacoes lentas (email, processamento)
9. **Webhook security** — assinatura HMAC, retry com backoff, dead letter queue
10. **Logging estruturado** — request ID, user ID, timestamp em todo log
11. **Idempotencia** — re-requests devem ser seguros (POST com idempotency key)
12. **Input validation** — Zod no boundary, confiar em tipos internamente
