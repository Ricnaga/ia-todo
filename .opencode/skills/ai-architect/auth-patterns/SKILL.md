---
name: auth-patterns
description: Use when designing authentication and authorization architecture, making auth-related technology decisions, or defining auth strategies for a project. Covers JWT, OAuth2/OIDC, sessions, RBAC, ABAC, PBAC, token management, frontend auth architecture, and security architecture. Trigger on keywords like "auth", "authentication", "authorization", "jwt", "oauth", "oidc", "rbac", "abac", "session", "token", "login", "sso", "security", "guard", "permission", "role".
---

# Auth Patterns — Arquitetura de Autenticação & Autorização

Referência completa para decisões arquiteturais de autenticação e autorização. Cobertura full-stack (backend + frontend) com foco em trade-offs, estratégias e segurança.

---

## 1. Estratégias de Autenticação

### Decision Matrix

| Estratégia             | Quando usar                          | Quando NÃO usar                  |
| ---------------------- | ------------------------------------ | -------------------------------- |
| **JWT (stateless)**    | APIs públicas, microservices, mobile | Sessões com estado servidor-side |
| **Session (stateful)** | Apps tradicionais, server-rendered   | APIs públicas, mobile            |
| **OAuth2/OIDC**        | Login social, SSO, APIs de terceiros | Auth interna simples             |
| **API Keys**           | Integração entre serviços            | Auth de usuário final            |
| **SAML**               | Enterprise SSO, compliance           | Apps modernos/mobile             |

### JWT — Arquitetura

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│  Server  │────▶│ Database │
└──────────┘     └──────────┘     └──────────┘
     │                │
     │  1. POST /auth │
     │  {email, pass} │
     │───────────────▶│
     │                │  2. Validate credentials
     │                │──────▶ DB
     │                │◀──────
     │  3. {access,   │
     │     refresh}   │
     │◀───────────────│
     │                │
     │  4. GET /data  │
     │  Authorization:│
     │  Bearer <jwt>  │
     │───────────────▶│
     │                │  5. Verify JWT (no DB call)
     │  6. Response   │
     │◀───────────────│
```

**Trade-offs JWT:**

| Aspecto         | JWT                              | Session                  |
| --------------- | -------------------------------- | ------------------------ |
| Escalabilidade  | ✅ Stateless, horizontal         | ⚠️ Precisa shared store  |
| Revogação       | ⚠️ Até expirar ou blacklist      | ✅ Imediata              |
| Tamanho payload | ⚠️ Cresce com claims             | ✅ Só session ID         |
| Performance     | ✅ Sem lookup no DB              | ⚠️ Lookup a cada request |
| Segurança       | ⚠️ Não pode invalidar facilmente | ✅ Pode invalidar        |

**Estrutura JWT (Header.Payload.Signature):**

```json
// Header
{ "alg": "RS256", "typ": "JWT" }

// Payload
{
  "sub": "user-123",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700000900,
  "iss": "myapp.com",
  "aud": "myapp.com"
}

// Signature
RS256(base64(header) + "." + base64(payload), privateKey)
```

**Regras JWT:**

- Access token: 15min (curto, para performance)
- Refresh token: 7d (longo, para UX)
- Usar RS256 (asymmetric) em produção — nunca HS256 compartilhado
- Validar `iss`, `aud`, `exp` no backend
- NUNCA放置 dados sensíveis no payload (é decodificável)
- Usar `jti` (JWT ID) para revogação individual

### Session — Arquitetura

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│  Server  │────▶│  Redis   │────▶│ Database │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │
     │  1. POST /auth │
     │───────────────▶│
     │  2. Set-Cookie:│
     │  sid=abc123    │
     │◀───────────────│
     │                │
     │  3. GET /data  │
     │  Cookie: sid   │
     │───────────────▶│
     │                │  4. Lookup sid in Redis
     │                │──────▶ Redis
     │                │◀──────
     │  5. Response   │
     │◀───────────────│
```

**Quando usar session:**

- App server-rendered (Next.js pages router)
- Quando precisa de revogação imediata
- Compliance exige controle total
- Equipe não tem experiência com JWT

**Configuração segura:**

```ts
// Session cookie config
{
  name: "sid",
  httpOnly: true,        // ✅ Sem acesso via JS
  secure: true,          // ✅ HTTPS only
  sameSite: "lax",       // ✅ Proteção CSRF básica
  maxAge: 7 * 24 * 3600, // 7 dias
  path: "/"
}
```

### OAuth2 / OIDC — Arquitetura

```
┌──────────┐  1. Authorize   ┌──────────┐
│  Client   │───────────────▶│ Provider │ (Google, GitHub, Keycloak)
└──────────┘                 └──────────┘
     │                             │
     │  2. User authenticates      │
     │     no provider             │
     │                             │
     │  3. Authorization code      │
     │◀────────────────────────────│
     │                             │
     │  4. Exchange code for token │
     │────────────────────────────▶│
     │                             │
     │  5. {access_token, id_token}│
     │◀────────────────────────────│
     │                             │
     │  6. GET /userinfo           │
     │     (OIDC standard)         │
     │────────────────────────────▶│
     │                             │
     │  7. User profile            │
     │◀────────────────────────────│
```

**OAuth2 Flows:**

| Flow                      | Onde usar                  | Segurança                     |
| ------------------------- | -------------------------- | ----------------------------- |
| Authorization Code + PKCE | SPA, mobile, apps públicos | ✅ Mais seguro                |
| Authorization Code        | Server-side web apps       | ✅ Seguro (com client_secret) |
| Client Credentials        | Machine-to-machine         | ✅ Seguro                     |
| Implicit                  | ❌ DEPRECATED              | ❌ Inseguro                   |
| Password                  | ❌ DEPRECATED              | ❌ Inseguro                   |

**OIDC vs OAuth2:**

- OAuth2: apenas autenticação (quem é o usuário)
- OIDC: autenticação + autorização (quem é + o que pode fazer)
- OIDC adiciona: `id_token` (JWT com dados do usuário), `/userinfo` endpoint, `scope: openid`

**Fluxo Authorization Code + PKCE (recomendado para SPA):**

```ts
// 1. Gerar code verifier e challenge
const codeVerifier = generateRandomString(128)
const codeChallenge = await sha256(codeVerifier)

// 2. Redirect para provider
const authUrl = new URL('https://provider.com/authorize')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('client_id', clientId)
authUrl.searchParams.set('redirect_uri', redirectUri)
authUrl.searchParams.set('scope', 'openid profile email')
authUrl.searchParams.set('code_challenge', codeChallenge)
authUrl.searchParams.set('code_challenge_method', 'S256')
authUrl.searchParams.set('state', generateRandomString(32))

// 3. Callback: trocar code por token
const tokenResponse = await fetch('https://provider.com/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  }),
})
```

---

## 2. Padrões de Autorização

### RBAC (Role-Based Access Control)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Usuário  │────▶│   Role   │────▶│Permission│
└──────────┘     └──────────┘     └──────────┘
```

**Quando usar:** Sistemas com hierarquia de papéis claros (admin, manager, user).

**Arquitetura:**

```ts
// Definição de papéis
interface RBACConfig {
  roles: {
    [role: string]: {
      permissions: string[] // ["users:read", "orders:write"]
      inherits?: string[] // ["user"] → herda permissões
    }
  }
}

// Exemplo
const rbacConfig: RBACConfig = {
  roles: {
    admin: {
      permissions: ['*'],
    },
    manager: {
      permissions: ['users:read', 'orders:*', 'reports:read'],
      inherits: ['user'],
    },
    user: {
      permissions: ['profile:*', 'orders:read', 'orders:create'],
    },
  },
}

// Middleware
function checkPermission(resource: string, action: string) {
  return (req, res, next) => {
    const userRole = req.user.role
    const permissions = resolvePermissions(userRole, rbacConfig)

    if (permissions.includes('*') || permissions.includes(`${resource}:${action}`)) {
      return next()
    }

    return res.status(403).json({ error: 'Insufficient permissions' })
  }
}
```

**Limitações RBAC:**

- Não lida bem com contextos (ex: "só ver pedidos do próprio usuário")
- Cresce exponencialmente com roles (`roles × resources × actions`)
- Não suporta condições dinâmicas

### ABAC (Attribute-Based Access Control)

```
┌──────────┐     ┌──────────┐
│  Subject  │     │ Resource │
│ (attrs)   │     │ (attrs)  │
└────┬─────┘     └────┬─────┘
     │                │
     ▼                ▼
┌──────────────────────────┐
│    Policy Decision Point │
│    (evalua Attributes)   │
└────────────┬─────────────┘
             │
     ┌───────┴───────┐
     │  ALLOW / DENY │
     └───────────────┘
```

**Quando usar:** Regras complexas baseadas em contexto (localização, tempo, dispositivo).

```ts
// Definição de política ABAC
interface ABACPolicy {
  name: string
  effect: 'allow' | 'deny'
  conditions: {
    subject?: Record<string, any> // { department: "engineering", level: "senior" }
    resource?: Record<string, any> // { owner: "$subject.id", classification: "internal" }
    action?: string
    environment?: Record<string, any> // { time: "business-hours", ip: "10.0.0.0/8" }
  }
}

// Políticas exemplo
const policies: ABACPolicy[] = [
  {
    name: 'owner-can-edit-own-orders',
    effect: 'allow',
    conditions: {
      subject: { role: 'user' },
      resource: { type: 'order', owner: '$subject.id' },
      action: 'update',
    },
  },
  {
    name: 'managers-view-department-reports',
    effect: 'allow',
    conditions: {
      subject: { role: 'manager', department: '$resource.department' },
      resource: { type: 'report' },
      action: 'read',
    },
  },
  {
    name: 'deny-external-access-sensitive-data',
    effect: 'deny',
    conditions: {
      resource: { classification: 'sensitive' },
      environment: { network: 'external' },
    },
  },
]

// Evaluador
function evaluate(subject, resource, action, environment): boolean {
  for (const policy of policies) {
    if (match(policy.conditions, { subject, resource, action, environment })) {
      return policy.effect === 'allow'
    }
  }
  return false // default deny
}
```

**Vantagens ABAC sobre RBAC:**

- Regras granulares e contextuais
- Não precisa criar roles para cada cenário
- Suporta condições dinâmicas (hora, IP, dispositivo)

### PBAC (Policy-Based Access Control)

**Quando usar:** When precisa de um engine de políticas dedicado (OPA, Casbin).

**OPA (Open Policy Agent):**

```rego
# policy.rego
package authz

default allow = false

# Admin pode tudo
allow {
  input.user.role == "admin"
}

# Usuário pode ver seus próprios pedidos
allow {
  input.method == "GET"
  input.path == ["orders", order_id]
  input.user.id == data.orders[order_id].owner_id
}

# Manager pode ver pedidos do departamento
allow {
  input.method == "GET"
  input.path == ["orders"]
  input.user.role == "manager"
  input.user.department == data.orders[order_id].department
}
```

**Casbin (Node.js):**

```ini
# model.conf
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act

# policy.csv
p, admin, *, *
p, manager, orders, read
p, user, profile, read
p, user, orders, create
g, alice, admin
g, bob, manager
```

### Comparação de Padrões

| Padrão            | Complexidade | Granularidade | Performance | Quando usar              |
| ----------------- | ------------ | ------------- | ----------- | ------------------------ |
| **RBAC**          | Baixa        | Baixa-Média   | ✅ Rápido   | Hierarquia simples       |
| **ABAC**          | Alta         | Alta          | ⚠️ Depende  | Regras contextuais       |
| **PBAC (OPA)**    | Média        | Alta          | ⚠️ Engine   | Multi-tenant, compliance |
| **PBAC (Casbin)** | Média        | Alta          | ✅ Rápido   | Apps Node.js             |

---

## 3. Gestão de Tokens

### Refresh Token Rotation

```
┌──────────┐                    ┌──────────┐
│  Client   │                    │  Server  │
└──────────┘                    └──────────┘
     │                              │
     │  1. GET /data                │
     │  Authorization: Bearer at1   │
     │─────────────────────────────▶│
     │                              │  2. Token expirado!
     │  401 + error: "expired"      │
     │◀─────────────────────────────│
     │                              │
     │  3. POST /auth/refresh       │
     │  { refresh_token: rt1 }      │
     │─────────────────────────────▶│
     │                              │  4. Validar rt1
     │                              │  5. Invalidar rt1
     │                              │  6. Gerar at2 + rt2
     │  7. { access: at2, refresh: rt2 } │
     │◀─────────────────────────────│
     │                              │
     │  8. Retry GET /data          │
     │  Authorization: Bearer at2   │
     │─────────────────────────────▶│
```

**Regras:**

- Cada refresh token pode ser usado **uma única vez**
- Ao usar um refresh token, gerar um novo (rotation)
- Se refresh token antigo for reutilizado → **possível roubo** → invalidar toda a família
- Armazenar refresh tokens no backend (DB ou Redis)

```ts
// Implementação de refresh token rotation
interface RefreshTokenRecord {
  id: string
  token: string // hash
  userId: string
  family: string // grupo de tokens da mesma sessão
  expiresAt: Date
  revokedAt?: Date
  createdAt: Date
}

async function handleRefresh(oldRefreshToken: string): Promise<Tokens> {
  const record = await db.refreshToken.findUnique({
    where: { token: hashToken(oldRefreshToken) },
  })

  if (!record || record.revokedAt) {
    // Refresh token já foi usado ou revogado → possível ataque
    // Invalidar toda a família
    await db.refreshToken.updateMany({
      where: { family: record?.family },
      data: { revokedAt: new Date() },
    })
    throw new UnauthorizedError('Token reuse detected')
  }

  // Invalidar o token atual
  await db.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  })

  // Gerar nova família de tokens
  const newTokens = generateTokens(record.userId)
  await db.refreshToken.create({
    data: {
      token: hashToken(newTokens.refreshToken),
      userId: record.userId,
      family: record.family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return newTokens
}
```

### Token Storage Strategies

| Local               | Risco XSS | Risco CSRF | Acessível por JS | Quando usar      |
| ------------------- | --------- | ---------- | ---------------- | ---------------- |
| **localStorage**    | ❌ Alto   | ✅ Baixo   | ✅ Sim           | ❌ Não usar      |
| **sessionStorage**  | ❌ Alto   | ✅ Baixo   | ✅ Sim           | ❌ Não usar      |
| **Cookie httpOnly** | ✅ Baixo  | ⚠️ Médio   | ❌ Não           | ✅ Recomendado   |
| **Memory (state)**  | ✅ Baixo  | ✅ Baixo   | ✅ Sim           | ✅ SPAs modernas |

**Recomendação atual:**

- Access token: **Memory** (React state) + interceptor para auto-refresh
- Refresh token: **Cookie httpOnly secure sameSite=strict**

### Token Revocation

| Estratégia                  | Latência        | Complexidade | Quando usar         |
| --------------------------- | --------------- | ------------ | ------------------- |
| **Blacklist (Redis)**       | ✅ Baixa        | Baixa        | JWT padrão          |
| **Short expiry + rotation** | ⚠️ Até expirar  | Baixa        | A maioria dos casos |
| **Token introspection**     | ⚠️ Network call | Média        | OAuth2/OIDC         |
| **Session store**           | ✅ Imediata     | Baixa        | Session-based       |

```ts
// Blacklist com Redis
async function revokeToken(jti: string, exp: number) {
  const ttl = exp - Math.floor(Date.now() / 1000)
  if (ttl > 0) {
    await redis.setex(`blacklist:${jti}`, ttl, '1')
  }
}

async function isTokenRevoked(jti: string): Promise<boolean> {
  return await redis.exists(`blacklist:${jti}`)
}

// Middleware
function authenticate() {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] })

    if (await isTokenRevoked(payload.jti)) {
      return res.status(401).json({ error: 'Token revoked' })
    }

    req.user = payload
    next()
  }
}
```

---

## 4. Frontend Auth Architecture

### Padrão: Auth Context + Protected Routes

```tsx
// contexts/auth-context.tsx
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Verificar sessão ao montar
    checkSession()
  }, [])

  async function checkSession() {
    try {
      // Refresh token automático
      const { user } = await api.post('/auth/refresh')
      setState({ user, isAuthenticated: true, isLoading: false })
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }

  async function login(email: string, password: string) {
    const { user } = await api.post('/auth/login', { email, password })
    setState({ user, isAuthenticated: true, isLoading: false })
  }

  async function logout() {
    await api.post('/auth/logout')
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}
```

```tsx
// components/protected-route.tsx
function ProtectedRoute({
  children,
  roles
}: {
  children: React.ReactNode
  roles?: string[]
}) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Uso
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute roles={["admin"]}>
  <AdminPanel />
</ProtectedRoute>
```

### Interceptor com Auto-Refresh

```ts
// lib/api.ts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!)
  })
  failedQueue = []
}

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { accessToken } = await api.post('/auth/refresh')
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Redirect para login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
```

### Next.js: Middleware de Auth

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Rotas públicas
  if (publicRoutes.includes(pathname)) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  // Rotas protegidas
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### RBAC no Frontend

```tsx
// Hook de permissões
function usePermissions() {
  const { user } = useAuth()

  function can(resource: string, action: string): boolean {
    if (!user) return false
    if (user.role === 'admin') return true

    const permissions = rolePermissions[user.role] ?? []
    return permissions.some(
      (p) => (p.resource === '*' || p.resource === resource) && p.action === action,
    )
  }

  function hasRole(role: string): boolean {
    return user?.role === role
  }

  return { can, hasRole }
}

// Uso condicional
function UserActions({ userId }: { userId: string }) {
  const { can } = usePermissions()

  return (
    <div>
      {can('users', 'read') && <ViewUser userId={userId} />}
      {can('users', 'update') && <EditUser userId={userId} />}
      {can('users', 'delete') && <DeleteUser userId={userId} />}
    </div>
  )
}
```

---

## 5. Segurança

### Headers de Segurança

```ts
// Helmet.js (Node.js)
import helmet from 'helmet'

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // evitar unsafe-inline
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.myapp.com'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
)
```

### CORS

```ts
// Configuração segura
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://myapp.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24h preflight cache
  }),
)
```

### Rate Limiting

```ts
// Rate limit para auth endpoints (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Too many attempts, try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
})

app.post('/auth/login', authLimiter, loginHandler)

// Rate limit geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
})
```

### OWASP Top 10 — Auth

| #   | Vulnerabilidade           | Mitigação                                         |
| --- | ------------------------- | ------------------------------------------------- |
| A01 | Broken Access Control     | RBAC/ABAC server-side, validação em cada endpoint |
| A02 | Cryptographic Failures    | RS256, bcrypt/argon2, TLS 1.3                     |
| A03 | Injection                 | Parameterized queries, input validation           |
| A04 | Insecure Design           | Threat modeling, auth review                      |
| A05 | Security Misconfiguration | Security headers, CORS restrito                   |
| A06 | Vulnerable Components     | Dependabot, audit de deps                         |
| A07 | Auth Failures             | Rate limiting, MFA, brute force protection        |
| A08 | Data Integrity            | JWT signature verification, checksums             |
| A09 | Logging Failures          | Audit log de tentativas de auth                   |
| A10 | SSRF                      | Whitelist de URLs                                 |

### Checklist de Segurança Auth

```markdown
## Autenticação

- [ ] Passwords hasheados com bcrypt/argon2 (custo >= 12)
- [ ] JWT com RS256 (asymmetric) em produção
- [ ] Access token expira em <= 15min
- [ ] Refresh token rotation habilitada
- [ ] Rate limiting em endpoints de auth (5 attempts/15min)
- [ ] Account lockout após N tentativas falhas
- [ ] MFA disponível para contas sensíveis
- [ ] Email de verificação obrigatório

## Autorização

- [ ] Validação server-side em TODOS os endpoints
- [ ] Não depender de autorização client-side
- [ ] Princípio do menor privilégio
- [ ] Logs de tentativas de acesso negado

## Tokens

- [ ] Tokens armazenados em httpOnly cookies ou memory
- [ ] NUNCA em localStorage/sessionStorage
- [ ] CSRF protection habilitada (SameSite cookies)
- [ ] Token revocation mechanism implementada

## Infraestrutura

- [ ] HTTPS forçado (HSTS)
- [ ] CORS restrito a origins conhecidos
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Secrets em variáveis de ambiente (nunca no código)
- [ ] Rotación de secrets periodicamente
```

---

## 6. Arquitetura de Referência

### Estrutura de Projeto

```
src/
├── modules/
│   └── auth/
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── user.ts
│       │   │   └── session.ts
│       │   ├── value-objects/
│       │   │   ├── email.ts
│       │   │   └── password.ts
│       │   ├── events/
│       │   │   ├── user-created.ts
│       │   │   └── user-logged-in.ts
│       │   └── repositories/
│       │       ├── user-repository.ts
│       │       └── session-repository.ts
│       ├── application/
│       │   ├── use-cases/
│       │   │   ├── register.ts
│       │   │   ├── login.ts
│       │   │   ├── refresh-token.ts
│       │   │   ├── logout.ts
│       │   │   ├── forgot-password.ts
│       │   │   └── reset-password.ts
│       │   └── dto/
│       │       ├── register.dto.ts
│       │       └── login.dto.ts
│       ├── infrastructure/
│       │   ├── providers/
│       │   │   ├── jwt-token-provider.ts
│       │   │   ├── bcrypt-hasher.ts
│       │   │   └── oauth-google-provider.ts
│       │   ├── repositories/
│       │   │   ├── prisma-user-repository.ts
│       │   │   └── redis-session-repository.ts
│       │   └── http/
│       │       ├── auth.controller.ts
│       │       ├── auth.routes.ts
│       │       └── auth.schema.ts
│       └── index.ts
├── shared/
│   ├── kernel/
│   │   ├── auth/
│   │   │   ├── authenticate.middleware.ts
│   │   │   ├── authorize.middleware.ts
│   │   │   └── rbac.ts
│   │   └── security/
│   │       ├── rate-limiter.ts
│   │       ├── cors.ts
│   │       └── helmet.ts
│   └── kernel.ts
└── bootstrap.ts
```

### Fluxo Completo

```
1. Register
   POST /auth/register → validate → hash password → create user → send verification email → return tokens

2. Login
   POST /auth/login → validate → find user → compare password → generate tokens → store refresh token → return tokens

3. Authenticated Request
   GET /data → authenticate middleware → verify JWT → check blacklist → attach user → authorize middleware → check permissions → handler

4. Token Refresh
   POST /auth/refresh → find refresh token → validate → revoke old → generate new → return new tokens

5. Logout
   POST /auth/logout → revoke refresh token → blacklist access token (optional) → clear cookie
```

---

## 7. Checklist de Decisão (ADR)

Ao definir auth para um novo projeto, responder:

```markdown
## Auth Architecture Decision

### 1. Estratégia de Autenticação

- [ ] JWT (stateless) / Session (stateful) / OAuth2 / Híbrido
- [ ] Justificativa: ___

### 2. Padrão de Autorização

- [ ] RBAC / ABAC / PBAC / Híbrido
- [ ] Justificativa: ___

### 3. Token Management

- [ ] Access token expiry: ___
- [ ] Refresh token: Sim / Não
- [ ] Refresh rotation: Sim / Não
- [ ] Storage: Cookie httpOnly / Memory

### 4. Frontend

- [ ] State management: Context / Zustand / Redux
- [ ] Protected routes: Sim / Não
- [ ] Auto-refresh: Sim / Não

### 5. Segurança

- [ ] MFA: Obrigatório / Opcional / Não
- [ ] Rate limiting: ___ requests / ___ minutes
- [ ] CSRF protection: Sim / Não
- [ ] Security headers: Sim / Não

### 6. Compliance (se aplicável)

- [ ] GDPR
- [ ] SOC2
- [ ] HIPAA
- [ ] Outro: ___
```

---

## Referências

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [RFC 7519 - JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 6749 - OAuth2](https://datatracker.ietf.org/doc/html/rfc6749)
- [OpenID Connect Spec](https://openid.net/specs/openid-connect-core-1_0.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
