---
description: Roda lint e format check no projeto ou diretório especificado.
agent: build
---

Execute as verificações de qualidade de código no projeto.

## Passos

1. Identificar o gerenciador de pacotes lendo o lockfile (este projeto usa `pnpm`)
2. Rodar o linter: `pnpm lint` (eslint)
3. Rodar formatação check: `pnpm format:check` (prettier --check .)
4. Rodar typecheck: `pnpm exec tsc --noEmit`
5. Se $ARGUMENTS tiver um path específico, rodar as verificações apenas nesse path

## Saída esperada

- Reportar erros encontrados com arquivo e linha
- Sugerir correções quando possível
- Se tudo estiver limpo, confirmar com "Todas as verificações passaram"

## Notas

- Se algum passo falhar, reportar o erro mas continuar com os próximos passos
- Preferir as ferramentas do projeto (verificar package.json scripts)
- Não usar `next lint` (deprecado no Next 16); o lint é via `eslint`
