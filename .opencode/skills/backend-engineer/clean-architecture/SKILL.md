---
name: clean-architecture
description: Use when designing or refactoring software architecture with Clean Architecture (Onion Architecture). Covers layer separation, dependency inversion, use cases, repository pattern, and domain isolation. Trigger on keywords like "clean architecture", "onion", "layers", "use cases", "repository pattern", "dependency inversion".
---

# Clean Architecture + DDD

Referência para aplicar Clean Architecture com Domain-Driven Design em projetos TypeScript.

## Visão Geral

```
src/
├── domain/                  # Camada de domínio (core)
│   ├── entities/            # Entidades de negócio
│   ├── value-objects/       # Objetos de valor
│   ├── repositories/        # Interfaces de repositório (ports)
│   ├── services/            # Services de domínio
│   └── errors/              # Erros de domínio
├── application/             # Camada de aplicação
│   ├── use-cases/           # Casos de uso
│   ├── dto/                 # Data Transfer Objects
│   └── interfaces/          # Interfaces externas (ports)
├── infrastructure/          # Camada de infraestrutura
│   ├── database/            # Implementações de repositório
│   ├── http/                # Controllers, middlewares
│   ├── auth/                # Autenticação
│   └── config/              # Configurações
└── presentation/            # Camada de apresentação (frontend)
    ├── components/
    ├── hooks/
    └── pages/
```

## Princípio da Dependência

A dependência vai de fora pra dentro. O domínio **nunca** depende de camadas externas.

```
presentation → application → domain ← infrastructure
                                ↑
                          (dependency inversion)
```

- **Domain**: não importa nada das outras camadas
- **Application**: importa domain
- **Infrastructure**: implementa interfaces do domain
- **Presentation**: importa application

## Domain Layer

### Entidades

```ts
// domain/entities/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    private _role: Role,
    public readonly createdAt: Date,
  ) {}

  get role(): Role {
    return this._role
  }

  promote(): void {
    if (this._role === 'admin') {
      throw new DomainError('User is already admin')
    }
    this._role = 'admin'
  }

  static create(input: CreateUserInput): User {
    // Lógica de criação com validação
    return new User(crypto.randomUUID(), input.name, input.email, 'user', new Date())
  }
}
```

### Value Objects

```ts
// domain/value-objects/email.ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    if (!raw.includes('@')) {
      throw new DomainError('Invalid email')
    }
    return new Email(raw.toLowerCase())
  }
}
```

### Repository Interface (Port)

```ts
// domain/repositories/user-repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
```

## Application Layer

### Use Cases

```ts
// application/use-cases/create-user.ts
export interface CreateUserInput {
  name: string
  email: string
}

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) {
      throw new ApplicationError('Email already in use')
    }

    const user = User.create(input)
    await this.userRepo.save(user)
    return user
  }
}
```

### DTOs

```ts
// application/dto/user-dto.ts
export interface UserDTO {
  id: string
  name: string
  email: string
  role: Role
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
```

## Infrastructure Layer

### Repository Implementation

```ts
// infrastructure/database/repositories/prisma-user-repository.ts
import { UserRepository } from '@/domain/repositories/user-repository'
import { prisma } from '../client'

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } })
    return data ? this.toDomain(data) : null
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {/* ... */},
      update: {/* ... */},
    })
  }

  private toDomain(data: any): User {
    return new User(data.id, data.name, data.email, data.role, data.createdAt)
  }
}
```

## Regras

1. **Domínio é puro**: sem imports de frameworks, databases, HTTP
2. **Use cases orquestram**: chamam domain + infrastructure (via interfaces)
3. **Infrastructure implementa**: repositórios, services externos, clients
4. **Dependency Inversion**: domínio define ports, infrastrutura implementa
5. **Entidades têm comportamento**: não são só structs de dados
6. **Value Objects são imutáveis**: validam no construtor
