# Fase 3 — Performance, Queries e Índices PostgreSQL

> Procedimento de coleta e tabela comparável: [Baseline PostgreSQL](./FASE-3-BASELINE-POSTGRES.md).

## Resposta objetiva sobre a necessidade de índices

**Sim, existem índices necessários ou fortemente recomendados com base nas consultas do código.** A auditoria encontrou filtros e ordenações frequentes que não são atendidos pela ordem dos índices atuais.

Entretanto, a análise foi estática. Antes de afirmar que cada índice reduz latência na VPS, é necessário confirmar cardinalidade e planos com:

- `pg_stat_statements`;
- `EXPLAIN (ANALYZE, BUFFERS)`;
- volume de linhas por tabela;
- taxa de escrita;
- quantidade de processos/réplicas.

A estratégia correta é:

```text
corrigir N+1/overfetch → medir baseline → aplicar índices prioritários
→ medir novamente → manter apenas índices usados
```

## 3.1 Índices prioritários sustentados pelo código

### 3.1.1 Membership por usuário e status

Evidência:

- `apps/api/src/http/routes/clubs/create-club.ts`
- `apps/api/src/http/routes/clubs/get-clubs.ts`
- filtros por `userId` e `status`.

Índice atual:

```prisma
@@unique([clubId, userId])
```

Esse índice ajuda pesquisas começando por `clubId`, mas não pesquisas apenas por `userId`.

Recomendação:

```prisma
model Member {
  @@unique([clubId, userId])
  @@index([userId, status], map: "members_user_status_idx")
}
```

SQL equivalente:

```sql
CREATE INDEX members_user_status_idx
ON members (user_id, status);
```

Prioridade: **alta**.

### 3.1.2 Corridas por clube e data

Evidência:

- `apps/api/src/http/routes/races/get-races.ts`
- filtro por `clubId` e `ORDER BY date`.

O modelo `Race` não possui índice em `clubId` ou `(clubId, date)`.

Recomendação:

```prisma
model Race {
  @@index([clubId, date], map: "races_club_date_idx")
}
```

```sql
CREATE INDEX races_club_date_idx
ON races (club_id, date);
```

Benefícios:

- Listagem de calendário por clube.
- Busca de corridas futuras/passadas.
- Operações relacionadas à FK/cascade por clube.

Prioridade: **alta**.

### 3.1.3 Participações por atleta

Evidência:

- `toggle-race-registration` verifica conflitos começando por `athleteId`.
- O unique atual começa por `raceId`.

Índice atual:

```prisma
@@unique([raceId, athleteId])
```

Recomendação:

```prisma
@@index([athleteId], map: "race_participants_athlete_idx")
```

```sql
CREATE INDEX race_participants_athlete_idx
ON race_participants (athlete_id);
```

Prioridade: **alta** se a busca de agenda/conflito por atleta for frequente.

### 3.1.4 Treinos concluídos por atleta, clube e período

Evidência:

- `apps/api/src/services/update-athlete-ranking.ts`
- filtro por `athleteId`, `clubId`, `status = COMPLETED` e intervalo de `date`.

Índices atuais separados:

```prisma
@@index([clubId])
@@index([athleteId])
```

Eles não substituem um índice composto adequado à consulta.

Recomendação PostgreSQL preferencial:

```sql
CREATE INDEX workouts_completed_athlete_club_date_idx
ON workouts (athlete_id, club_id, date)
WHERE status = 'COMPLETED';
```

Como é índice parcial, deve ser mantido em migração SQL customizada; o schema Prisma pode não representar todos os detalhes.

Alternativa não parcial:

```prisma
@@index(
  [athleteId, clubId, status, date],
  map: "workouts_athlete_club_status_date_idx"
)
```

Prioridade: **alta**, especialmente enquanto ranking e relatórios consultarem treinos por período.

### 3.1.5 Feed de treinos por clube/status/data de criação

Evidência:

- `apps/api/src/http/routes/workouts/get-workouts.ts`
- filtro por `clubId`, `status` e ordenação por `createdAt DESC`.

Recomendação:

```prisma
@@index(
  [clubId, status, createdAt],
  map: "workouts_club_status_created_idx"
)
```

SQL:

```sql
CREATE INDEX workouts_club_status_created_idx
ON workouts (club_id, status, created_at DESC);
```

Prioridade: **alta** quando o feed crescer; validar seletividade de `status`.

### 3.1.6 Audit logs por data

Evidência:

- `apps/api/src/http/routes/system/get-system-logs.ts`
- filtros/ordenação por `createdAt`.

Recomendação inicial:

```prisma
@@index([createdAt], map: "audit_logs_created_at_idx")
```

```sql
CREATE INDEX audit_logs_created_at_idx
ON audit_logs (created_at DESC);
```

A busca `contains` case-insensitive em ação, entidade, nome ou e-mail não será bem atendida por B-tree. Se o volume justificar:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX audit_logs_action_trgm_idx
ON audit_logs USING gin (action gin_trgm_ops);
```

Aplicar trigram apenas após medir frequência e custo da busca textual.

Prioridade: `createdAt` **média/alta**; trigram **sob medição**.

## 3.2 Índices derivados das mudanças das fases anteriores

### Tokens

Após adicionar expiração:

```prisma
@@index([userId, type, expiresAt], map: "tokens_user_type_expiry_idx")
```

### Ranking reprojetado

```prisma
@@unique([clubId, athleteId, periodType, periodStart])
@@index([clubId, periodType, periodStart, points])
```

O unique atende upsert por atleta/período; o segundo índice atende listagem do ranking do clube.

### Resultados por atleta

O unique `(raceId, athleteId)` não atende consultas começando apenas por atleta. Adicionar somente se `pg_stat_statements` mostrar consultas frequentes de histórico por atleta:

```prisma
@@index([athleteId], map: "race_results_athlete_idx")
```

## 3.3 Índices que não devem ser adicionados automaticamente

Evitar:

- Índice isolado de `members.clubId`, porque o unique `(clubId, userId)` já cobre o prefixo `clubId`.
- Índices em booleanos isolados, como `isPremium`, sem alta seletividade ou combinação adequada.
- Índice B-tree para `contains`/`ILIKE '%texto%'`; usar trigram quando necessário.
- Índices duplicados com mesma coluna inicial e uso equivalente.
- Criar todos os candidatos de uma vez sem medir impacto de escrita e espaço.

## 3.4 Corrigir queries antes de indexar

### N+1 de corridas

Atual:

```text
1 query de corridas + N queries de participação
```

Alvo:

```text
1 query de corridas + 1 query de participações com raceId IN (...)
```

### Overfetch de membros

Substituir:

```ts
include: {
  user: { include: { athleteProfile: true } },
  invoices: true,
}
```

por `select` mínimo. Para atraso, buscar apenas existência/count de invoice `OVERDUE`.

### Estatísticas

Substituir carregamento de histórico por `aggregate`, `_sum`, `_count` e, quando aplicável, SQL agregado.

### Ranking

Após a Fase 2, preferir agregações e `upsert` apoiado por unique real. Isso reduz o custo atual de múltiplas leituras/escritas por período.

## 3.5 Protocolo de medição na VPS

### Inventário básico

```sql
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

```sql
SELECT
  relname,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Consultas mais caras

Habilitar `pg_stat_statements` conforme a configuração do PostgreSQL da VPS e consultar:

```sql
SELECT
  calls,
  mean_exec_time,
  total_exec_time,
  rows,
  query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 30;
```

Não publicar resultados contendo parâmetros ou PII.

### Plano de uma consulta

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT ...;
```

Registrar:

- planejamento e execução;
- `Seq Scan` versus `Index Scan`;
- linhas estimadas versus reais;
- buffers lidos;
- sort em memória/disco;
- tempo antes e depois.

Usar dados anonimizados ou executar com cuidado em produção; `ANALYZE` executa a consulta real.

## 3.6 Deploy de índices

Em tabelas pequenas e sem usuários, `CREATE INDEX` comum é simples. Com tráfego/dados reais, preferir criação concorrente quando aplicável:

```sql
CREATE INDEX CONCURRENTLY workouts_club_status_created_idx
ON workouts (club_id, status, created_at DESC);
```

Cuidados:

- `CREATE INDEX CONCURRENTLY` não pode executar dentro de transação explícita.
- Confirmar como a migration será executada pelo pipeline.
- Em falha, pode restar índice inválido; verificar `pg_index.indisvalid`.
- Monitorar duração, I/O e espaço em disco.
- Não usar `CONCURRENTLY` em ambiente de teste transacional sem adaptação.

## 3.7 Pool e concorrência

Configurar orçamento explícito:

```text
conexões por processo × processos/réplicas
+ workers
+ migrations
+ reserva administrativa
< max_connections
```

Parâmetros:

- `DB_POOL_MAX`;
- `connectionTimeoutMillis`;
- `idleTimeoutMillis`;
- timeout de statement/transação no PostgreSQL conforme política.

Não aumentar pool para esconder N+1; isso apenas transfere a pressão para o banco.

## Critério de saída

- N+1 de corridas removido.
- Rotas críticas usam `select`/agregação mínima.
- Baseline das principais queries documentado.
- Índices prioritários aplicados com plano antes/depois.
- Nenhum índice redundante criado sem justificativa.
- Pool dimensionado para a topologia real da VPS.
- P95/P99 e consumo de conexões monitorados.
