---
name: hexagonal-architecture
description: Use when designing or refactoring with Hexagonal Architecture (Ports and Adapters). Covers driving/driven ports, adapters, dependency injection, and core isolation. Trigger on keywords like "hexagonal", "ports and adapters", "adapter", "port", "driven adapter", "driving adapter".
---

# Hexagonal Architecture + DDD

Referência para aplicar Arquitetura Hexagonal (Ports and Adapters) com DDD em projetos TypeScript.

## Visão Geral

```
src/
├── core/                    # Core do sistema (domínio + ports)
│   ├── domain/              # Entidades, value objects, services
│   ├── ports/
│   │   ├── driven/          # Ports que o core consome (repositórios, gateways)
│   │   └── driving/         # Ports que o core expõe (use cases, commands)
│   └── errors/
├── adapters/                # Implementações dos ports
│   ├── driven/              # Adapters de saída (banco, APIs externas, queues)
│   │   ├── database/
│   │   ├── external-api/
│   │   └── queue/
│   └── driving/             # Adapters de entrada (HTTP, CLI, events)
│       ├── http/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   └── routes/
│       └── cli/
└── config/                  # Configurações, DI container
```

## Princípio

- **Core não depende de nada externo**
- **Driving adapters** = entradas (HTTP, CLI, eventos que chegam)
- **Driven adapters** = saídas (banco, APIs externas, filas que o core chama)

```
                  ┌─────────────────────┐
                  │    Driving Adapters  │
                  │    (HTTP, CLI)       │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │   Driving Ports      │
                  │   (Use Cases)        │
                  ├─────────────────────┤
                  │      CORE           │
                  │   (Domain + Rules)  │
                  ├─────────────────────┤
                  │   Driven Ports       │
                  │   (Repository, etc)  │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │    Driven Adapters   │
                  │    (DB, API, Queue)  │
                  └─────────────────────┘
```

## Core Layer

### Domain

```ts
// core/domain/entities/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    private _role: Role,
  ) {}

  promote(): void {
    if (this._role === 'admin') throw new DomainError('Already admin')
    this._role = 'admin'
  }
}
```

### Driven Ports (interfaces que o core define)

```ts
// core/ports/driven/user-repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}

// core/ports/driven/email-sender.ts
export interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>
}
```

### Driving Ports (use cases)

```ts
// core/ports/driving/create-user.ts
export interface CreateUserPort {
  execute(input: CreateUserInput): Promise<UserDTO>
}

// core/domain/services/create-user.ts
export class CreateUserUseCase implements CreateUserPort {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: CreateUserInput): Promise<UserDTO> {
    const user = User.create(input)
    await this.userRepo.save(user)
    await this.emailSender.send(user.email, 'Bem-vindo!', '...')
    return toUserDTO(user)
  }
}
```

## Adapters Layer

### Driven Adapters (implementações)

```ts
// adapters/driven/database/prisma-user-repository.ts
export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } })
    return data ? this.toDomain(data) : null
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({/* ... */})
  }
}

// adapters/driven/external-api/smtp-email-sender.ts
export class SmtpEmailSender implements EmailSender {
  async send(to: string, subject: string, body: string): Promise<void> {
    // envio via SMTP
  }
}
```

### Driving Adapters (entradas)

```ts
// adapters/driving/http/controllers/user-controller.ts
export class UserController {
  constructor(private readonly createUser: CreateUserPort) {}

  async create(req: Request, res: Response) {
    const result = await this.createUser.execute(req.body)
    return res.status(201).json(result)
  }
}
```

## Dependency Injection

```ts
// config/container.ts
import { CreateUserUseCase } from '@/core/domain/services/create-user'
import { PrismaUserRepository } from '@/adapters/driven/database/prisma-user-repository'
import { SmtpEmailSender } from '@/adapters/driven/external-api/smtp-email-sender'
import { UserController } from '@/adapters/driving/http/controllers/user-controller'

export function createContainer() {
  const userRepo = new PrismaUserRepository()
  const emailSender = new SmtpEmailSender()
  const createUser = new CreateUserUseCase(userRepo, emailSender)
  const userController = new UserController(createUser)

  return { userController }
}
```

## Regras

1. **Core é independente**: não importa adapters, frameworks, libs externas
2. **Ports definem contratos**: core diz o que precisa, não como fazer
3. **Adapters são intercambiáveis**: trocar Prisma por Drizzle = só trocar adapter
4. **Driving = entradas**: HTTP controller, CLI, consumer de fila
5. **Driven = saídas**: banco de dados, API externa, fila, email
6. **DI no bootstrap**: conectar tudo no entry point da aplicação
7. **Testes no core**: testar use cases com mocks dos ports, sem infraestrutura
