# Fase 3 — Baseline PostgreSQL e evidência de queries

Este documento define uma medição reproduzível para a Fase 3. Os resultados devem ser preenchidos por ambiente; esta implementação não presume cardinalidade, plano ou latência da VPS.

## Segurança da coleta

- Usar banco de staging ou janela controlada para `EXPLAIN ANALYZE`.
- Não registrar `Authorization`, tokens, senhas, e-mail completo, dados médicos, `routeData` ou payloads com PII.
- Substituir IDs por contagens/`<id>` e remover literais antes de publicar resultados.
- `pg_stat_statements` deve ser habilitado pelo administrador do PostgreSQL.

## Inventário e capacidade

```sql
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

SELECT
  relname,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

SELECT
  count(*) FILTER (WHERE state = 'active') AS active,
  count(*) FILTER (WHERE state = 'idle') AS idle,
  count(*) AS total
FROM pg_stat_activity
WHERE datname = current_database();
```

## Queries mais frequentes/caras

```sql
SELECT
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(total_exec_time::numeric, 2) AS total_ms,
  rows,
  shared_blks_hit,
  shared_blks_read,
  regexp_replace(query, E'[[:space:]]+', ' ', 'g') AS normalized_query
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
ORDER BY total_exec_time DESC
LIMIT 30;
```

Antes de exportar, revisar `normalized_query` e remover parâmetros/identificadores que ainda possam ser sensíveis.

## Plano comparável

Executar no staging com parâmetros representativos e registrar o JSON completo internamente:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON)
SELECT ...;
```

Para cada endpoint, registrar somente:

| Campo | Baseline | Pós-mudança |
|---|---:|---:|
| p50/p95/p99 (ms) | | |
| queries/request | | |
| rows scanned / returned | | |
| shared buffers hit/read | | |
| planning/execution (ms) | | |
| custo estimado | | |
| Seq Scan / Index Scan | | |
| sort em disco | | |
| locks/wait (ms) | | |

## Escopo prioritário

1. `GET /clubs/:slug/races`: antes `1 + N` queries de participação; alvo `1 + 1`.
2. Atualização de ranking: antes 3 leituras de workouts; alvo 1 leitura + 3 upserts.
3. `GET /clubs/:slug/members`: selecionar apenas existência de invoice `OVERDUE` (`take: 1`).
4. `GET /clubs/:slug/workouts`: verificar count, página e filtro de visibilidade.
5. `GET /clubs/:slug/rankings`: verificar ranking + agregação agrupada.
6. Dashboard: verificar seletividade de `club_id/status/date` e concorrência das agregações.

## Critério de decisão de índice

Manter um índice somente se o plano demonstrar uso ou redução comprovável de custo/latência que justifique espaço e custo de escrita. Comparar `n_tup_ins`, `n_tup_upd`, `n_tup_del`, tamanho do índice e impacto de locks. Não adicionar índices isolados de baixa seletividade nem índices para `ILIKE '%texto%'` sem evidência de frequência.

## Pool e observabilidade da API

Registrar por request apenas rota, status, duração, request ID não sensível e contagem de queries. Medir p50/p95/p99 no Fastify e acompanhar conexões do pool. Não aumentar o pool para compensar N+1.
