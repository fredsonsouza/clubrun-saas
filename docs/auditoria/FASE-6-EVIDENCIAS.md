# Fase 6 — Registro de homologação e go-live

Este arquivo é um registro operacional. Nenhum item deve ser marcado como aprovado sem evidência anexada e responsável/data.

O workflow `homologation.yml` é manual (`workflow_dispatch`) para evitar custo/efeito operacional em cada push. O smoke local pode ser executado com `pnpm --filter @saas/api test:smoke` enquanto a API estiver disponível.

## Ambiente

| Item | Valor | Evidência | Responsável/data |
|---|---|---|---|
| Commit/release | | | |
| Node | 20.19.0 | | |
| PostgreSQL | | | |
| Reverse proxy/TLS | | | |
| Object storage | | | |
| Worker de e-mail | | | |
| Pool/max_connections | | | |
| Rate limits | | | |

## Segurança e tenant

Executar a matriz da `FASE-6-HOMOLOGACAO-GO-LIVE.md`, preservando somente resultados anonimizados. Anexar IDs de teste, não PII ou tokens.

| Área | Resultado | Evidência |
|---|---|---|
| Auth/OTP/OAuth | PENDENTE — suíte unitária existente; E2E requer PostgreSQL | |
| RBAC/cross-tenant | PENDENTE — executar em homologação | |
| Privacidade/DTOs | PENDENTE — revisar evidências de payload/log | |
| Anonimização/storage | PENDENTE — provider real necessário | |
| Idempotência/concorrência | PENDENTE — executar carga/concorrência | |

## Performance

| Rota/cenário | P50 | P95 | P99 | Erros | Observação |
|---|---:|---:|---:|---:|---|
| Login | | | | | |
| Feed workouts | | | | | |
| Ranking | | | | | |
| Membros | | | | | |
| Upload | | | | | |

Durante a carga, preservar snapshots anonimizados de `pg_stat_statements`, pool, CPU, memória, disco e planos das cinco queries mais caras.

## Recuperação

| Teste | Resultado | Evidência |
|---|---|---|
| Backup completo | PENDENTE | |
| Restore PostgreSQL | PENDENTE | |
| Restore storage | PENDENTE | |
| RTO medido | PENDENTE | |
| RPO medido | PENDENTE | |
| Migration após restore | PENDENTE | |
| Forward-fix | PENDENTE | |
| Rotação de segredo | PENDENTE | |

## Gate final

Status atual: **NÃO APROVADO** até os itens acima serem executados em ambiente equivalente à produção. O workflow `.github/workflows/homologation.yml` automatiza migration, E2E, build e smoke test, mas não substitui restore real, carga real, TLS, storage real, PSP ou revisão independente.

Validação local desta execução: typecheck monorepo, 154 testes unitários e build da API passaram. E2E não foi executado com sucesso porque o PostgreSQL local não possui o banco base `club_run`; o workflow de homologação cria um PostgreSQL isolado em CI.
