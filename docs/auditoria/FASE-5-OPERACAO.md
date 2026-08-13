# Fase 5 — Operação, CI/CD e rollback

## Gates de CI

O workflow `.github/workflows/ci.yml` executa com `pnpm install --frozen-lockfile`:

O gate global de Biome permanece intencionalmente bloqueante. Na situação atual do repositório, a execução local reporta erros/avisos preexistentes fora desta alteração; eles devem ser corrigidos em lotes próprios antes de o CI ficar verde. Nenhum erro global é mascarado por exclusões amplas.

1. Biome;
2. typecheck de env/auth/api/web;
3. testes de auth e API;
4. migration deploy em PostgreSQL de serviço;
5. teste opt-in da migration da Fase 4;
6. build da API e web.

O pacote web possui o nome estável `@clubrun/web` e um script `test` explícito. Workspaces sem uma tarefa declarada devem ser adicionados ao workflow ou receber uma tarefa que falhe explicitamente; sucesso por “zero tarefas” não é gate válido.

## Migrations

Uso local:

```bash
pnpm --filter @saas/api db:migrate:dev
pnpm --filter @saas/api db:migrate:status
```

Deploy:

```bash
pnpm --filter @saas/api db:migrate:deploy
```

Produção exige backup verificado antes do deploy e execução em cópia restaurada antes de alterações destrutivas. O histórico Prisma é forward-only; correções devem ser novas migrations.

## Health e shutdown

- `GET /health` confirma processo HTTP ativo.
- `GET /ready` executa `SELECT 1` e retorna `503` se o banco não estiver pronto.
- `GET /metrics` expõe contadores mínimos de requests/erros/duração; em produção exige `METRICS_TOKEN` via header `x-metrics-token`.
- `SIGTERM`/`SIGINT` param o aceite de novas conexões, fecham Fastify, Prisma e pool uma única vez.
- A topologia deve encaminhar tráfego somente após `/ready` retornar `200`.

## Segurança operacional

- CORS usa allowlist `CORS_ORIGINS`; ausência de allowlist não libera origem arbitrária.
- Swagger não é registrado em produção.
- Headers padrão incluem `nosniff`, `Referrer-Policy` e `X-Frame-Options`; HSTS só é emitido em produção.
- `SERVER_PORT` é a única fonte da porta da API.
- `SKIP_ENV_VALIDATION` só aceita o literal `true`.
- URLs localhost são rejeitadas em produção.
- Segredos JWT/TOKEN_PEPPER exigem no mínimo 32 bytes em produção.

## Erros e incidentes

Erros retornam `code` estável. Falhas 500 recebem `incidentId`, enquanto logs estruturados registram somente método, URL, incident ID e mensagem sanitizada. Não registrar tokens, cookies, Authorization, senha, e-mail completo, dados médicos ou GeoJSON.

## Rollback

Não fazer rollback de migration aplicada apagando ou editando histórico. Procedimento:

1. interromper deploy;
2. preservar logs e incident ID;
3. avaliar se a aplicação anterior é compatível com o schema atual;
4. aplicar forward-fix;
5. restaurar backup somente como operação de recuperação aprovada;
6. repetir smoke test em `/health`, `/ready` e rotas críticas.
