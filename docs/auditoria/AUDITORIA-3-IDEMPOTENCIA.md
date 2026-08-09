# Auditoria 3 — Idempotência, Retries e Concorrência

Data da revisão: 2026-08-08.

## Resposta objetiva

**Sim, a aplicação precisa de idempotência em operações específicas.** Não deve ser aplicada como uma tabela/middleware genérico para todos os endpoints.

O código necessita de quatro mecanismos diferentes:

1. **Idempotency key** para criações sem chave natural e efeitos externos.
2. **Chave natural + unique/upsert** quando o domínio já identifica unicamente a operação.
3. **Transição condicional/optimistic locking** para mudanças de estado concorrentes.
4. **Estado explícito em vez de toggle** para operações que podem ser repetidas pelo cliente.

Apenas desabilitar o botão no React não oferece garantia. Não protege contra duas abas, timeout, retry HTTP, processo concorrente ou chamada manual.

## Escopo

Foram revisados os 42 handlers mutáveis registrados em produção, além de:

- Server Actions e chamadas HTTP do Next;
- comportamento padrão de retry do `ky`;
- constraints e upserts do Prisma;
- efeitos derivados em treino, tênis, ranking, auditoria e e-mail;
- fluxo simulado de billing/checkout;
- uploads locais.

Não foi encontrada nenhuma implementação de:

- header `Idempotency-Key`;
- `requestId` de negócio;
- tabela de idempotência;
- deduplicação de evento externo;
- hash de payload associado a tentativa.

---

# 1. Matriz de decisão

## Operações que precisam de idempotency key ou ID de comando

| Operação | Motivo | Solução recomendada |
|---|---|---|
| Criar treino | Retry cria outro slug com `Date.now()`, outro treino e novos efeitos | ID gerado pelo cliente + `PUT`, ou `Idempotency-Key` |
| Criar corrida | Não há chave natural; duas corridas iguais podem ser legítimas | ID gerado pelo cliente ou `Idempotency-Key` |
| Criar sessão de pagamento futura | PSP pode receber duas criações após timeout | Idempotency key também enviada ao PSP |
| Processar webhook futuro | Provider reenvia eventos por design | Unique por `provider + eventId` |
| Upload, se retry transparente for habilitado | Cada tentativa cria outro UUID/arquivo órfão | `uploadId` ou checksum + lifecycle temporário |
| Feedback, se o produto exigir exatamente uma submissão | Texto igual pode ser legítimo, então conteúdo não é chave suficiente | `submissionId` gerado pelo cliente |

## Operações que não precisam de chave genérica, mas precisam de transição atômica

| Operação | Controle correto |
|---|---|
| Completar treino | `UPDATE ... WHERE status = PLANNED`; só o vencedor aplica efeitos |
| Editar treino/tênis | Transação + versão/compare-and-set |
| Excluir treino | Delete e devolução de tênis na mesma transação |
| Resultado de corrida | Natural key `(raceId, athleteId)` + efeito de tênis apenas no create vencedor |
| Pagar invoice | Transição condicional `status != PAID → PAID` |
| Desativar clube | Transição condicional `ACTIVE → DEACTIVATED` |
| Transferir propriedade | Compare-and-set `ownerId = requesterId` |
| Trocar senha | Compare-and-set no hash/versão de sessão observado |
| Alterar papel exclusivo | Transação/lock/constraint por clube e papel |
| Anonimizar usuário | Uma única transação entre todas as tabelas |

## Operações que devem deixar de ser `toggle`

| Atual | Problema | Contrato recomendado |
|---|---|---|
| `POST .../toggle-registration` | Retry pode inscrever e logo desinscrever | `PUT .../participants/me` e `DELETE .../participants/me` |
| `POST .../reactions` como toggle | Retry pode adicionar e remover a reação | `PUT .../reactions/me` e `DELETE .../reactions/me` |
| Toggle visual de pagamento | Cliente calcula estado com snapshot possivelmente antigo | Enviar o status desejado + versão, não “inverter” no servidor |

## Operações já naturalmente idempotentes ou adequadamente one-shot

- Definir `isPremium = true` é naturalmente convergente, embora a rota simulada deva ficar desabilitada em produção.
- Update de corrida com mesmo payload converge e não possui efeito incremental atual.
- Disconnect Strava define campos como `null`.
- Reset de senha e verificação de e-mail devem permanecer one-shot por segurança; não precisam de chave genérica.
- Login por senha/Google representa uma nova tentativa/sessão e não deve ser deduplicado.
- Rejeitar/revogar convite ou deletar recurso converge para estado ausente; pode retornar 204 também quando já ausente.

---

# 2. Achados críticos

## ID-01 — Criação de treino duplica entidade e efeitos derivados

Localização:

- `apps/api/src/http/routes/workouts/create-workout.ts#L158-L239`
- `apps/web/src/app/(app)/[slug]/dashboard/actions.ts#L8-L46`
- `apps/web/src/http/create-workout.ts`

O slug contém `Date.now()`. Cada reenvio cria outro treino. Para treino concluído, também pode:

- decrementar o tênis novamente;
- recalcular ranking sobre a duplicata;
- alterar pace médio;
- gerar outro audit log.

Solução preferencial:

```text
Browser gera workoutId UUID uma vez ao abrir/submeter o formulário
PUT /clubs/:slug/workouts/:workoutId
```

A PK fornecida pelo cliente torna a criação naturalmente repetível. Alternativa: manter POST e exigir `Idempotency-Key`.

## ID-02 — Conclusão concorrente debita tênis múltiplas vezes

Localização:

- `apps/api/src/http/routes/workouts/complete-workout.ts#L41-L55`
- `apps/api/src/http/routes/workouts/complete-workout.ts#L85-L145`

Duas requisições podem ler `PLANNED` antes que qualquer uma faça update. Ambas concluem e debitam o tênis.

Correção:

```ts
const transitioned = await tx.workout.updateMany({
  where: {
    id: workoutId,
    clubId,
    athleteId,
    status: 'PLANNED',
  },
  data: completedData,
})

if (transitioned.count !== 1) {
  // Consultar estado final e retornar sucesso/recurso já concluído,
  // ou 409 quando o payload conflitar.
}
```

Somente a transação vencedora pode alterar tênis, ranking e auditoria.

## ID-03 — Resultado de corrida possui linha idempotente, mas efeito não idempotente

Localização:

- `apps/api/src/http/routes/races/create-race-result.ts#L77-L141`
- `apps/api/prisma/schema.prisma#L250-L263`

O `upsert` e unique `(raceId, athleteId)` evitam duas linhas de resultado. Porém duas requisições podem observar `existingResult = null` e ambas decrementar o tênis.

Correção:

- criar/atualizar resultado e ledger do tênis na mesma transação;
- debitar somente quando a criação da natural key for vencedora;
- alternativa robusta: ledger com unique `(sourceType, sourceId)`.

Exemplo conceitual:

```prisma
model ShoesMileageEntry {
  id         String @id @default(uuid())
  athleteId  String
  sourceType String
  sourceId   String
  distanceKm Float

  @@unique([sourceType, sourceId])
}
```

## ID-04 — Update/delete de treino possuem efeitos incrementais fora de transação

Localização:

- `apps/api/src/http/routes/workouts/update-workout.ts#L108-L187`
- `apps/api/src/http/routes/workouts/delete-workout.ts#L62-L91`

No update, o tênis é ajustado antes do treino. No delete, o tênis é creditado antes da exclusão. Falha ou concorrência permite débito/crédito repetido.

Correção: transação, conditional update e versão do recurso.

```prisma
version Int @default(0)
```

```ts
where: {
  id: workoutId,
  version: expectedVersion,
}

data: {
  ...changes,
  version: { increment: 1 },
}
```

## ID-05 — Toggles são incompatíveis com retry

Localização:

- `apps/api/src/http/routes/races/toggle-race-registration.ts#L56-L109`
- `apps/api/src/http/routes/workouts/toggle-workout-reaction.ts#L55-L98`

Se a primeira resposta se perde, o cliente reenvia e desfaz o sucesso anterior. Unique constraints não corrigem a intenção invertida.

Correção:

```text
PUT    /clubs/:slug/races/:raceId/participants/me
DELETE /clubs/:slug/races/:raceId/participants/me

PUT    /clubs/:slug/workouts/:workoutId/reactions/me
DELETE /clubs/:slug/workouts/:workoutId/reactions/me
```

O `PUT` de reação usa upsert; o DELETE aceita ausência e retorna 204.

---

# 3. Retries do frontend

## Política atual do `ky`

`apps/web/src/http/api-client.ts` não define `retry`.

Na versão atual, o comportamento padrão considera alguns métodos, como PUT e DELETE, retentáveis, enquanto POST/PATCH não recebem a mesma política. Isso torna mutações semelhantes inconsistentes por acidente.

Hotfix:

```ts
export const mutationApi = api.extend({
  retry: 0,
})
```

Usar esse cliente para todas as mutações até o backend garantir idempotência. Leituras podem manter retry controlado.

Depois das correções, habilitar retry apenas por operação comprovadamente segura.

## Loading do React não é garantia

`disabled={isLoading}` melhora UX, mas não impede:

- segundo evento antes do próximo render;
- duas abas;
- retry após timeout;
- chamada por script;
- duas instâncias da API.

Pode-se adicionar `useRef` como guarda síncrona para UX, mas a garantia deve estar na API/banco.

## Fluxos sem proteção visual suficiente

- alteração de papel de membro;
- solicitação de entrada em clube em algumas telas;
- confirmação modal de inscrição que não aguarda callback;
- input de upload não desabilitado durante envio.

Essas proteções devem ser corrigidas, mas não substituem idempotência server-side.

---

# 4. Chaves naturais e deduplicação

## Casos em que o banco já oferece uma chave útil

| Fluxo | Chave natural/unique |
|---|---|
| Usuário | e-mail/username |
| Membership/join request | `(clubId, userId)` |
| Convite | `(email, clubId)` |
| Waitlist | e-mail |
| Resultado de corrida | `(raceId, athleteId)` |
| Participação em corrida | `(raceId, athleteId)` |
| Reação | `(workoutId, userId)` |
| Conta OAuth | `(provider, providerAccountId)` |

O problema é que vários handlers usam check-then-create. A constraint evita duplicação, mas o segundo request recebe erro em vez da resposta da primeira tentativa. Isso é **deduplicação por conflito**, não replay idempotente.

Melhorias:

- usar upsert quando semanticamente correto;
- capturar unique violation e consultar o recurso existente;
- confirmar que o payload corresponde à mesma intenção antes de retornar sucesso;
- não tratar conflitos diferentes como sucesso.

## Cadastro

Não é obrigatório introduzir `Idempotency-Key` no cadastro. E-mail normalizado é uma chave natural adequada. O necessário é:

- transação para usuário/token/membership quando aplicável;
- outbox para e-mail;
- em retry, retomar workflow incompleto de forma segura;
- não revelar existência da conta indevidamente.

## Tokens de autenticação

Para recuperação/reenvio:

- uma credencial ativa por `(userId, type)`;
- cooldown;
- emissão/upsert transacional;
- outbox identificada pelo token/evento;
- reenvios intencionais geram nova versão, retries da mesma intenção não geram spam.

---

# 5. Modelo de idempotency key

Usar somente nas operações classificadas como necessárias.

Modelo conceitual:

```prisma
enum IdempotencyStatus {
  PROCESSING
  COMPLETED
  FAILED
}

model IdempotencyRecord {
  id            String            @id @default(uuid())
  principalKey  String            @map("principal_key")
  scope         String
  keyHash       String            @map("key_hash")
  requestHash   String            @map("request_hash")
  status        IdempotencyStatus
  responseCode  Int?              @map("response_code")
  responseBody  Json?             @map("response_body")
  resourceId    String?           @map("resource_id")
  lockedUntil   DateTime?         @map("locked_until")
  expiresAt     DateTime          @map("expires_at")
  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  @@unique([principalKey, scope, keyHash])
  @@index([expiresAt])
  @@map("idempotency_records")
}
```

`principalKey` deve ser não nulo:

- usuário autenticado: user ID;
- fluxo anônimo: identificador não sensível/HMAC do principal conforme o caso.

Não armazenar chave bruta se ela puder aparecer em logs. Não guardar senha, token ou resposta com PII desnecessária em `responseBody`; quando possível, persistir apenas `resourceId` e reconstruir o DTO.

## Regras de processamento

1. Validar formato/tamanho do header.
2. Canonicalizar e hashear payload relevante.
3. Tentar criar registro `PROCESSING` com unique.
4. Se a chave já existe:
   - hash diferente: 409;
   - `COMPLETED`: devolver mesma resposta/recurso;
   - `PROCESSING`: 409/425 com retry-after;
   - lease expirada: permitir retomada controlada.
5. Executar gravações de domínio e marcar `COMPLETED` na mesma transação quando tudo está no PostgreSQL.
6. Para efeito externo, persistir outbox na transação e usar a mesma chave no provider.
7. Definir TTL por domínio; não conservar respostas indefinidamente.

## Mesmo key com payload diferente

Deve sempre falhar:

```text
409 IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD
```

Nunca executar a segunda intenção usando a mesma chave.

---

# 6. Transições condicionais

Idempotency key não substitui controle de concorrência.

## Invoice

Atual: qualquer retry redefine `paidAt` e cria novo audit.

Alvo:

```ts
const paid = await tx.invoice.updateMany({
  where: {
    id: invoiceId,
    clubId,
    status: { not: 'PAID' },
  },
  data: {
    status: 'PAID',
    paidAt: paidAtFromProvider,
  },
})

if (paid.count === 1) {
  await tx.auditLog.create(...)
}
```

## Transferência de propriedade

A transação atual não impede duas transferências concorrentes. Fazer compare-and-set:

```ts
const transferred = await tx.club.updateMany({
  where: {
    id: clubId,
    ownerId: requesterId,
  },
  data: {
    ownerId: targetId,
  },
})

if (transferred.count !== 1) {
  throw new ConflictError('A propriedade já foi alterada')
}
```

## Papéis exclusivos

A demotion e promotion precisam de transação/lock e, se a regra for realmente “um por clube”, constraint de banco. Loading no menu não resolve duas requisições concorrentes.

---

# 7. E-mail, auditoria e outbox

## E-mail

Cada mensagem deve possuir chave única de negócio, por exemplo:

```text
EMAIL_VERIFICATION:<tokenId>
PASSWORD_RECOVERY:<tokenId>
INVITE:<inviteId>:CREATED
```

O worker pode repetir envio técnico de forma controlada, mas não criar novos tokens a cada retry interno.

## Auditoria

Definir semântica:

- login: um log por tentativa é correto;
- `INVOICE_PAID`: um log por transição é correto;
- `SHUTDOWN_CLUB`: um log por transição é correto;
- update genérico: decidir se representa request aceito ou mudança real.

Audit crítico deve estar na transação ou outbox. `setImmediate` não fornece idempotência nem durabilidade.

---

# 8. Pagamento futuro

Idempotência será obrigatória quando o gateway for implementado:

1. API gera/stabiliza `checkoutAttemptId`.
2. Usa a mesma idempotency key ao criar sessão no PSP.
3. Persiste correlação local.
4. Webhook é deduplicado por `(provider, eventId)` unique.
5. Estado só avança por máquina de estados válida.
6. Evento duplicado retorna 2xx sem reaplicar cobrança/entitlement.
7. Audit/outbox são criados apenas pela transição vencedora.
8. Reconciliação consulta provider em caso de resposta ambígua.

Nunca liberar premium com base apenas no redirect do browser.

---

# 9. Uploads

Upload não exige deduplicação global por conteúdo em todos os casos, pois duas entidades podem usar a mesma imagem. O necessário é evitar arquivos órfãos em retry:

- `uploadId` estável por intenção;
- objeto temporário com TTL;
- associação final do objeto à entidade;
- remoção dos temporários não associados;
- opcionalmente checksum para integridade/dedupe de storage;
- substituição explícita remove ou agenda remoção da imagem anterior.

---

# 10. Testes obrigatórios

## Retry após resposta perdida

Para cada operação crítica:

1. aplicar a mutação;
2. simular perda da resposta;
3. reenviar mesma chave/payload;
4. confirmar mesma resposta/recurso;
5. confirmar um único efeito persistente.

## Concorrência

Executar simultaneamente:

- duas conclusões do mesmo treino;
- duas exclusões do mesmo treino;
- dois resultados para corrida/atleta;
- duas transferências de propriedade;
- duas promoções ao mesmo papel exclusivo;
- dois pagamentos da mesma invoice;
- dois webhooks com mesmo event ID;
- mesma idempotency key com payload igual e diferente.

## Assertions

- tênis alterado exatamente uma vez;
- um único treino/corrida criado;
- um único audit de transição;
- uma única mensagem outbox por evento;
- um único entitlement;
- ranking reconstruível e sem duplicata;
- mesma key + payload diferente retorna 409;
- toggle removido não inverte intenção em retry.

---

# 11. Ordem recomendada

## Hotfix

1. Configurar `retry: 0` para mutações no `ky`.
2. Trocar toggles por PUT/DELETE explícitos.
3. Tornar complete/update/delete de treino transacionais e condicionais.
4. Corrigir resultado de corrida/tênis.
5. Tornar invoice e shutdown transições condicionais.

## Próximo deploy

1. Implementar idempotency key para criação de treino e corrida.
2. Adicionar optimistic locking onde há edição concorrente.
3. Tornar auditoria crítica transacional.
4. Criar outbox com unique de evento.
5. Ajustar deletes para sucesso quando estado ausente já foi atingido.

## Antes de pagamento real

1. Idempotency key no PSP.
2. Deduplicação unique de webhook.
3. Máquina de estados financeira.
4. Reconciliação e outbox.
5. Testes de retry/timeout obrigatórios.

## Critério de conclusão

- Nenhum efeito monetário, de tênis, ranking, membership ou ownership é aplicado duas vezes.
- Retries de criação retornam o mesmo recurso.
- Toggles não existem em contratos mutáveis críticos.
- Retry do cliente é explícito por operação.
- Chaves reutilizadas com payload diferente são rejeitadas.
- Eventos externos são deduplicados por ID do provider.
