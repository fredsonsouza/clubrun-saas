# Fase 0 — Contenção e Hotfix de Produção

## Objetivo

Reduzir imediatamente a superfície explorável da VPS antes de refatorações maiores. Esta fase deve ser curta, reversível e priorizar bloqueio de risco.

## Pré-requisitos

- Acesso administrativo à VPS e ao PostgreSQL.
- Backup completo do banco e dos uploads.
- Teste de restauração em ambiente isolado.
- Registro da versão/commit atualmente implantado.

## 0.1 Rotacionar a conta administrativa

Arquivos relacionados:

- `apps/api/prisma/seed.ts`
- `credentials.md`
- páginas em `apps/web/src/app/admin`

Checklist:

- [ ] Confirmar se `admin@clubrun.com` existe na VPS.
- [ ] Alterar imediatamente a senha conhecida do seed.
- [ ] Invalidar JWTs/sessões existentes da conta.
- [ ] Remover senha literal de `seed.ts`.
- [ ] Impedir execução do seed destrutivo em `NODE_ENV=production`.
- [ ] Remover fallback de superadmin baseado em e-mail; usar somente `isSystemAdmin`.
- [ ] Se o repositório foi compartilhado, considerar a senha comprometida mesmo após removê-la do branch atual.

Critério de aceite:

- A senha antiga não autentica.
- O seed de desenvolvimento exige credencial fornecida fora do código.
- Nenhuma autorização usa comparação com `admin@clubrun.com`.

## 0.2 Bloquear endpoints simulados em produção

Arquivos relacionados:

- `apps/api/src/http/routes/athlete/subscribe-athlete.ts`
- `apps/api/src/http/routes/billing/activate-billing.ts`
- `apps/web/src/app/(app)/checkout/checkout-client.tsx`

Implementação temporária:

```ts
if (env.NODE_ENV === 'production') {
  throw new ForbiddenError('Fluxo de simulação indisponível em produção')
}
```

Checklist:

- [ ] Não registrar as rotas simuladas em produção, ou fazê-las retornar 403.
- [ ] Remover `localStorage`, cookie client-side e query string como fonte de entitlement.
- [ ] Bloquear `createClub` na API sem entitlement server-side.
- [ ] Documentar explicitamente quais comportamentos continuam simulados em homologação.

Critério de aceite:

- Uma chamada manual autenticada não consegue ativar `isPremium` ou billing na produção.
- `/create-club?checkoutComplete=true` não libera criação sem autorização da API.

## 0.3 Fechar IDORs cross-tenant prioritários

Rotas:

- `PUT /clubs/:slug/members/:memberId`
- pagamento de invoice
- pagamento de participante de corrida
- conclusão de treino
- reação a treino

Padrão obrigatório:

```ts
const resource = await prisma.resource.findFirst({
  where: {
    id: resourceId,
    clubId: club.id,
  },
})
```

Para update condicional:

```ts
const result = await prisma.resource.updateMany({
  where: {
    id: resourceId,
    clubId: club.id,
  },
  data,
})

if (result.count !== 1) {
  throw new ResourceNotFoundError('Recurso não encontrado')
}
```

Checklist:

- [ ] `memberId` vinculado ao `club.id`.
- [ ] `invoiceId` vinculado ao `club.id`.
- [ ] `raceId` validado por `race.clubId`.
- [ ] `workoutId` vinculado ao `club.id`.
- [ ] Ranking usa `workout.clubId`, nunca o slug não validado.
- [ ] Reações verificam tenant e visibilidade do treino.
- [ ] Testes tentam usar autorização do clube A sobre recurso do clube B.

## 0.4 Bloquear escalada de papel

Checklist:

- [ ] Remover `update_roles` de `MANAGER`.
- [ ] Remover `OWNER` da rota genérica de atualização.
- [ ] Impedir `MANAGER` de criar convite `ADMIN`.
- [ ] Corrigir a divergência entre `roleSchema` e enum Prisma (`VISITOR`).
- [ ] Fazer o teste existente de permissão de `MANAGER` executar no pipeline correto.

Regra temporária conservadora:

- Apenas o proprietário real (`Club.ownerId`) altera papéis administrativos.
- `OWNER` só muda via transferência.
- Em caso de dúvida, negar e retornar 403.

## 0.5 Restringir dados privados até a política definitiva

Hotfix recomendado:

- [ ] Negar listagem interna de membros para `VISITOR`, `PENDING` e `INACTIVE`.
- [ ] Negar listagem de solicitações pendentes para não administradores.
- [ ] Retirar `medicalConditions`, nascimento e e-mail de listas genéricas.
- [ ] Filtrar treinos públicos para usuários que não são dono/coach autorizado.
- [ ] Retornar 404 para perfil privado sem relação autorizada.

## 0.6 Conter upload local

Checklist imediato:

- [ ] Limitar upload por usuário e por IP, além do limite por arquivo.
- [ ] Gerar extensão no servidor; nunca preservar extensão arbitrária do cliente.
- [ ] Rejeitar qualquer formato que não possa ser decodificado como imagem.
- [ ] Remover arquivos rastreados com `git rm --cached apps/api/uploads/...`.
- [ ] Verificar se os arquivos rastreados contêm fotos pessoais; se sim, limpar o histórico Git conforme política interna.
- [ ] Monitorar espaço livre e configurar alerta de disco na VPS.

## 0.7 Verificar migrações e banco da VPS

Não aplicar novas migrações antes de:

```text
backup → restore isolado → prisma migrate status → inspeção de dados → ensaio de deploy
```

Checklist:

- [ ] Verificar se `birthDate`/`birth_date` sofreu perda.
- [ ] Verificar se `imageUrl`/`image_url` sofreu perda.
- [ ] Verificar se a migração de `WorkoutType` foi aplicada com tabela preenchida.
- [ ] Conferir duplicatas em rankings mensais/anuais.
- [ ] Conferir memberships `OWNER` versus `Club.ownerId`.

## 0.8 Corrigir dependências críticas de runtime

O `pnpm audit --prod` confirmou vulnerabilidades críticas em CASL e na cadeia JWT, além de advisories altos em Next/Fastify.

Hotfix mínimo, em lotes pequenos:

```bash
pnpm --filter @saas/auth add @casl/ability@6.8.1
pnpm --filter @saas/api add @fastify/jwt@10.2.1 fastify@5.11.3
pnpm --filter ./apps/web add next@16.3.0 react@19.2.8 react-dom@19.2.8
```

Checklist:

- [ ] Atualizar CASL para linha 6 corrigida, sem major desnecessário.
- [ ] Atualizar `@fastify/jwt` para resolver `fast-jwt >= 6.2.4`.
- [ ] Atualizar Fastify dentro do major 5.
- [ ] Atualizar Next para versão corrigida dos advisories RSC/Server Actions.
- [ ] Executar `pnpm audit --prod` após regenerar o lockfile.
- [ ] Executar testes, typecheck e build; não considerar apenas instalação bem-sucedida.
- [ ] Atualizar `@fastify/static` em lote isolado e testar `/uploads`.
- [ ] Não usar `pnpm update --latest -r` para o hotfix.

Detalhes: [Plano de Dependências e Modernização Criptográfica](./PLANO-DEPENDENCIAS-CRIPTOGRAFIA.md).

## 0.9 Desabilitar retries automáticos em mutações inseguras

O cliente `ky` não possui política explícita; PUT/DELETE podem ser retentados enquanto vários handlers ainda possuem efeitos incrementais não idempotentes.

Hotfix:

- [ ] Criar cliente de mutação com `retry: 0`.
- [ ] Usá-lo em PUT/PATCH/POST/DELETE até cada operação ser classificada como segura.
- [ ] Manter retry controlado apenas para leituras.
- [ ] Não considerar `disabled/loading` do React como garantia server-side.
- [ ] Substituir inscrição/reação `toggle` por PUT/DELETE de estado explícito.

Detalhes: [Auditoria 3 — Idempotência](./AUDITORIA-3-IDEMPOTENCIA.md).

## 0.10 Corrigir bugs React de efeito imediato

Checklist:

- [ ] Corrigir retorno condicional antes de hooks em `AthleteDetailsModal`.
- [ ] Remover retorno latente antes de hooks em `ProfileButton` ou mover para wrapper.
- [ ] Adicionar `type="button"` ao botão de remover imagem.
- [ ] Limpar timers de checkout/verificação no unmount.
- [ ] Impedir resposta de corrida/cidade antiga de sobrescrever seleção atual.
- [ ] Reinicializar página/hasMore quando o feed inicial mudar.
- [ ] Remover botões aninhados dentro de `Link`/`a`.

Detalhes: [Auditoria 4 — React e Next](./AUDITORIA-4-REACT-NEXT.md).

## Testes mínimos da fase

1. Admin do clube A não altera membro do clube B.
2. Admin do clube A não paga invoice do clube B.
3. Atleta não conclui treino usando slug de outro clube.
4. `MANAGER` não promove `ADMIN`, `OWNER` ou outro `MANAGER`.
5. `VISITOR` não obtém dados internos, e-mails, nascimento ou condições médicas.
6. Endpoints simulados retornam 403 ou não existem em produção.
7. Extensão/MIME falsificados são rejeitados.
8. `pnpm audit --prod` não reporta CASL/fast-jwt vulneráveis no lockfile.
9. Login, CASL, Server Actions e páginas RSC passam após os updates.
10. Mutações inseguras não recebem retry automático do cliente.
11. Repetir inscrição/reação não inverte o estado desejado.
12. Abrir/fechar `AthleteDetailsModal` não altera a ordem dos hooks.
13. Remover imagem não submete o formulário.
14. Fechar/navegar durante checkout impede timers pendentes de executar efeitos.

## Critério de saída

A Fase 0 termina somente quando os testes negativos acima passam na versão implantada e a senha administrativa antiga está invalidada.
