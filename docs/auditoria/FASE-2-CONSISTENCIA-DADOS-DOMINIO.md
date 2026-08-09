# Fase 2 — Consistência de Dados e Lógica de Domínio

## Objetivo

Eliminar estados parciais, corridas de concorrência e divergências entre dados fonte e projeções derivadas.

## 2.1 Estratégia segura de migração

Antes de qualquer alteração:

1. Gerar backup do PostgreSQL.
2. Restaurar em banco isolado.
3. Executar `prisma migrate status`.
4. Conferir quais migrações destrutivas já foram aplicadas.
5. Medir duplicatas e inconsistências atuais.
6. Criar migrações forward-only.
7. Ensaiar deploy e rollback operacional.

Não editar migração já aplicada sem entender o histórico de todos os ambientes.

## 2.2 Reparar dados potencialmente perdidos

Verificações:

- [ ] `athlete_profiles.birth_date` versus backups/valor default em massa.
- [ ] `races.image_url` versus arquivos e backups anteriores.
- [ ] Valores de `workouts.type` após recriação da coluna.
- [ ] Valores de enum removidos.
- [ ] Duplicatas de ranking mensal/anual.

Se não houver fonte para restauração, registrar formalmente a perda e impedir nova ocorrência.

## 2.3 Serviço transacional de treino

Criar serviços de domínio separados do handler HTTP:

```text
createWorkout()
completeWorkout()
updateCompletedWorkout()
deleteCompletedWorkout()
rebuildAthleteProjections()
```

Cada serviço deve usar um transaction client e executar:

1. Carregar/validar o recurso no tenant.
2. Validar transição de estado.
3. Persistir o treino.
4. Ajustar tênis.
5. Recalcular pace médio.
6. Recalcular ranking dos períodos afetados.
7. Criar audit log/outbox.

Transição concorrente:

```ts
const result = await tx.workout.updateMany({
  where: {
    id: workoutId,
    clubId,
    athleteId,
    status: 'PLANNED',
  },
  data: {
    status: 'COMPLETED',
    ...completedData,
  },
})

if (result.count !== 1) {
  throw new ConflictError('Treino já processado')
}
```

Checklist:

- [ ] Completar duas vezes não decrementa tênis duas vezes.
- [ ] Excluir duas vezes não devolve quilometragem duas vezes.
- [ ] Falha no ranking faz rollback do treino e tênis.
- [ ] Mudança de data recalcula período antigo e novo.
- [ ] Update/delete recalculam pace e ranking.
- [ ] Pace médio considera apenas `COMPLETED`.

## 2.4 Reprojetar ranking

Modelo recomendado:

```prisma
enum RankingPeriodType {
  WEEK
  MONTH
  YEAR
}

model Ranking {
  id          String            @id @default(uuid())
  clubId      String
  athleteId   String
  periodType  RankingPeriodType
  periodStart DateTime
  points      Int               @default(0)

  @@unique([clubId, athleteId, periodType, periodStart])
  @@index([clubId, periodType, periodStart, points])
}
```

Benefícios:

- Sem `NULL` na identidade.
- `upsert` real.
- Semana ISO representada pela data inicial, evitando combinação incorreta de semana/ano.
- Consultas por período ficam mais simples.

Plano de migração:

1. Criar novas colunas nullable.
2. Backfill usando datas corretas.
3. Deduplicar registros escolhendo/recalculando a projeção correta.
4. Criar unique.
5. Alterar código para nova chave.
6. Tornar colunas obrigatórias.
7. Remover colunas antigas em migração posterior.

## 2.5 Validar números e fórmulas

Schemas devem ser discriminados pelo tipo de treino.

Para corrida/caminhada:

```ts
z.object({
  type: z.enum(['EASY', 'INTERVAL', 'TEMPO', 'LONG', 'RECOVERY', 'RACE', 'WALK']),
  distance: z.number().finite().positive().max(500),
  duration: z.number().finite().positive(),
})
```

Para força:

```ts
z.object({
  type: z.literal('STRENGTH'),
  duration: z.number().finite().positive(),
  distance: z.literal(0).optional(),
})
```

Regras:

- [ ] Pace sempre derivado de duração/distância no servidor.
- [ ] Definir unidade oficial: distância em km e duração em segundos.
- [ ] Definir precisão/arredondamento somente na apresentação.
- [ ] Ranking não confia em pace enviado pelo cliente.
- [ ] Corridas rejeitam distância zero/negativa.
- [ ] Adicionar constraints para quilometragem restante não negativa.

## 2.6 Invariantes de proprietário e membership

Invariantes obrigatórias:

```text
1. Cada clube tem exatamente um proprietário lógico.
2. Club.ownerId aponta para Member ACTIVE/OWNER do mesmo clube.
3. OWNER não pode ser removido ou inativado.
4. Transferência não aceita o próprio owner como destino.
5. Destino precisa estar ACTIVE.
6. Papel OWNER não pode ser atribuído fora da transferência.
```

Checklist:

- [ ] Criar serviço único de transferência.
- [ ] Bloquear remoção/inativação do owner.
- [ ] Validar `leaveAfterTransfer` dentro da transação.
- [ ] Tratar anonimização de proprietário antes de apagar dados.
- [ ] Definir comportamento de clube `DEACTIVATED` para cada comando.
- [ ] Centralizar `requireActiveClub` e `assertCanJoinAnotherClub`.

## 2.7 Dinheiro e faturamento

Antes de pagamento real:

```prisma
amount Decimal @db.Decimal(12, 2)
```

ou:

```prisma
amountInCents Int
currency      String @default("BRL")
```

Checklist:

- [ ] Definir moeda.
- [ ] Evitar `Float`.
- [ ] Arredondar em uma única camada.
- [ ] Preparar idempotency key para futuros webhooks.
- [ ] Modelar estado de invoice e transições permitidas.

## 2.8 Convites e associação única

Checklist:

- [ ] Token com digest, expiração, status e consumo.
- [ ] Aceite exige e-mail verificado correspondente.
- [ ] Link compartilhável possui rotação/revogação.
- [ ] Definir regra real de usuário em um ou múltiplos clubes.
- [ ] Aplicar a mesma regra em convite, domínio, link e aprovação.
- [ ] Remover ou implementar `approveInvite`; não retornar falso sucesso.

## 2.9 Idempotência e controle de concorrência

Não usar chave de idempotência em todas as rotas. Aplicar por categoria:

- [ ] Criação de treino e corrida: ID gerado pelo cliente ou `Idempotency-Key`.
- [ ] Resultado de corrida: natural key `(raceId, athleteId)` + efeito de tênis no create vencedor.
- [ ] Conclusão de treino: transição condicional `PLANNED → COMPLETED`.
- [ ] Update de treino: versão/optimistic locking.
- [ ] Delete de treino: delete + devolução de tênis na mesma transação.
- [ ] Invoice: `status != PAID → PAID`, com audit apenas no vencedor.
- [ ] Shutdown: `ACTIVE → DEACTIVATED`, com audit apenas no vencedor.
- [ ] Ownership: compare-and-set do `ownerId` observado.
- [ ] Papel exclusivo: transação/lock/constraint de unicidade.
- [ ] Cadastro/join/invite/waitlist: usar chaves naturais e replay seguro, não tabela genérica.
- [ ] Reset/verificação: manter token one-shot.

Se for criada tabela de idempotência, ela deve vincular principal, scope, hash da chave, hash do payload, status, recurso/resposta e expiração. Mesma chave com payload diferente retorna 409.

Detalhes: [Auditoria 3 — Idempotência](./AUDITORIA-3-IDEMPOTENCIA.md).

## Testes de concorrência e consistência

1. Duas conclusões simultâneas do mesmo treino.
2. Dois resultados simultâneos da mesma corrida.
3. Duas transferências simultâneas do mesmo clube.
4. Dois upserts simultâneos do mesmo ranking mensal.
5. Exclusão que falha após ajuste de tênis deve fazer rollback.
6. Alterar treino entre semanas recalcula ambas.
7. Anonimizar owner exige transferência/encerramento prévio.
8. Reprocessamento idempotente não muda resultado final.
9. Retry de criação com mesma key retorna o mesmo recurso.
10. Mesma key com payload diferente retorna 409.
11. Audit/outbox de transição é criado exatamente uma vez.

## Critério de saída

- Nenhuma mutação crítica deixa estado parcial em falha simulada.
- Ranking não possui duplicatas e pode ser reconstruído a partir de treinos.
- Invariantes de owner/membership estão cobertas por testes.
- Migrações passam sobre cópia representativa do banco.
