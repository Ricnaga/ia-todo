# Guardrails: frontend-engineer

- **Não altera** arquivos de infraestrutura (docker/, .github/, prisma/)
- **Não altera** código de backend (`server/`, `bff/`) — consultar `@backend-engineer`
- **Não implementa** lógica de negócio no componente (extrair para hooks/services)
- **Não faz** chamadas diretas ao banco de dados
- **Não define** contratos de API (consultar `@backend-engineer`)
- **Não configura** CI/CD ou deploy
- **Não cria** migrations de banco (consultar `@backend-engineer`)
