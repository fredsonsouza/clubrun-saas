# Auditoria 2 — Contratos Frontend/Backend, Qualidade e Arquitetura

Data da revisão: 2026-08-08.

## Escopo

Esta revisão complementa a auditoria de segurança original e foca em:

- divergências de contratos entre Fastify e Next.js;
- funções, condicionais e fluxos com comportamento incorreto;
- `any`, `z.any()`, suppressões TypeScript e catches silenciosos;
- componentes/handlers excessivamente grandes;
- organização da monorepo;
- scripts `pnpm`, Turbo e Biome;
- dependências desatualizadas e vulneráveis;
- modernização criptográfica.

Nenhum código de produção foi alterado durante a auditoria.

## Resumo executivo

A segunda revisão confirmou que a monorepo possui um problema estrutural de **contratos duplicados manualmente**. O backend valida uma forma, o frontend declara outra, e casts `any` mascaram o drift. Já existem casos que podem quebrar telas ou descartar dados silenciosamente.

Principais novos achados:

1. `email` é nullable na API, mas obrigatório no Web; a tela chama `.toLowerCase()` e pode quebrar.
2. O frontend tipa `role` em `GET /profile`, mas a API não retorna esse campo.
3. `birthDate` é opcional no cliente e obrigatório no backend.
4. `WorkoutType` aceita string arbitrária em update e falha no Prisma como 500.
5. `VISITOR` existe no schema CASL, mas não no enum persistido do Prisma.
6. Slug e descrição preenchidos na criação de clube são descartados.
7. A rota `GET /workouts/my-stats` existe, mas não é registrada.
8. Erro da inscrição em corrida acessa `response.json.message` sem executar `json()`.
9. Pace decimal é formatado matematicamente errado (`5.50` vira `5:50`, mas deveria ser `5:30`).
10. Há componentes client de 800–1.332 linhas e boundaries server/client misturados.
11. `pnpm audit --prod` encontrou 120 ocorrências: 4 críticas, 45 altas, 64 moderadas e 7 baixas.
12. CASL, `fast-jwt`, Next.js e Fastify possuem advisories aplicáveis às versões instaladas.

## Matriz dos achados desta revisão

| ID | Severidade | Categoria | Achado |
|---|---|---|---|
| CT-01 | Alta | Contrato | `Member.email` nullable na API e obrigatório no Web |
| CT-02 | Média | Contrato | `GET /profile` não retorna o `role` declarado pelo Web |
| CT-03 | Alta | Contrato | `birthDate` opcional no Web e obrigatório no backend |
| CT-04 | Alta | Contrato/Enum | Update de treino aceita `string`, Prisma exige `WorkoutType` |
| CT-05 | Alta | Contrato/Enum | `VISITOR` pode chegar a persistência, mas não existe no Prisma |
| CT-06 | Média | UX/Contrato | Slug e descrição do clube são descartados |
| CT-07 | Média | Registro de rota | `getMyStats` não é registrado no Fastify |
| CT-08 | Média | Erros | Inscrição em corrida lê `response.json` incorretamente |
| CT-09 | Média | Unidades | Pace decimal formatado como centésimos, não segundos |
| CT-10 | Média | Unidades | Distância em km é tratada como metros em card compartilhável |
| CT-11 | Média | Cache | Tags de cache sem invalidação correspondente |
| CT-12 | Alta | Privacidade/Contrato | Dados médicos usam privilégio do perfil-alvo, não do solicitante |
| CT-13 | Alta | Privacidade/Contrato | `isPublic` ausente pode transformar perfil privado em público |
| CQ-01 | Alta | Type safety | 46 declarações `any`, 42 casts `as any`, 16 `z.any()` |
| CQ-02 | Média | Erros | Quatro catches vazios em produção |
| CQ-03 | Média | Organização | Componentes client com até 1.332 linhas |
| CQ-04 | Média | Arquitetura | Cliente HTTP universal mistura server e browser |
| CQ-05 | Média | Arquitetura | `packages/env` mistura API, Next server e browser |
| CQ-06 | Média | Build | Packages source-only sem `exports`, build ou typecheck explícito |
| CQ-07 | Média | Organização | Bootstrap Fastify centraliza plugins, rotas, storage e listen |
| CQ-08 | Baixa | Naming | Nomes inconsistentes e resíduos de template |
| DEP-01 | Crítica | Supply chain | CASL 6.7.3 vulnerável a prototype pollution |
| DEP-02 | Crítica | Supply chain/JWT | `fast-jwt` 6.1.0 com advisories críticos |
| DEP-03 | Alta | Supply chain | Next 16.0.8 com advisories de DoS/Server Actions/RSC |
| DEP-04 | Alta | Supply chain | Fastify 5.6.2 com bypass de validação e DoS |
| DEP-05 | Alta | Supply chain | Dependências transitivas vulneráveis em Prisma/tooling e frontend |

---

# 1. Inconsistências de contrato

## CT-01 — `Member.email` quebra a tela para usuário sem privilégio

Localização:

- API: `apps/api/src/http/routes/members/get-members.ts#L24-L42`
- API: `apps/api/src/http/routes/members/get-members.ts#L81-L104`
- Web: `apps/web/src/http/get-members.ts#L7-L23`
- Web: `apps/web/src/app/(app)/[slug]/members/member-grid.tsx#L52-L55`

A API retorna `email: null` para usuários sem papel privilegiado. O Web declara `email: string` e executa:

```ts
m.email.toLowerCase()
```

Impacto: `TypeError: Cannot read properties of null` ao pesquisar/renderizar membros.

Correção imediata:

```ts
email: string | null
```

```ts
const searchableEmail = member.email?.toLowerCase() ?? ''
```

Correção estrutural: compartilhar `MemberDto` em `packages/contracts`.

## CT-02 — `GET /profile` possui campo fantasma `role`

Localização:

- Web: `apps/web/src/http/get-profile.ts#L3-L14`
- API: `apps/api/src/http/routes/auth/get-profile.ts#L19-L30`
- API: `apps/api/src/http/routes/auth/get-profile.ts#L74-L84`

O Web exige `user.role`, mas a API não declara nem envia esse campo. Para usuários multiclube, um papel global também seria conceitualmente ambíguo.

Correção:

- remover `role` do perfil global;
- obter papel da membership do clube ativo;
- compartilhar o contrato real.

## CT-03 — Atualização parcial exige nascimento apenas no backend

Localização:

- API: `apps/api/src/http/routes/athlete/update-athlete-profile.ts#L20-L39`
- Web: `apps/web/src/http/update-athlete-profile.ts#L3-L21`

Backend:

```ts
birthDate: z.coerce.date()
```

Frontend:

```ts
birthDate?: Date
```

Impacto: atualização apenas de avatar, bio ou tênis pode receber 400.

Decisão necessária:

- Se a rota é PATCH semântico, tornar `birthDate` opcional.
- Se é substituição completa, exigir todos os campos em todos os clientes e usar PUT de forma consistente.

A recomendação é PATCH com schema parcial explícito.

## CT-04 — `WorkoutType` inválido chega ao Prisma

Localização:

- API: `apps/api/src/http/routes/workouts/update-workout.ts#L22-L30`
- API: `apps/api/src/http/routes/workouts/update-workout.ts#L144-L157`
- Prisma: `apps/api/prisma/schema.prisma#L359-L368`
- Web: `apps/web/src/app/(app)/profile/actions.ts#L162-L183`

A API aceita `type: z.string()`, mas o Prisma exige enum. Valor adulterado passa pela borda HTTP e vira 500.

Correção:

```ts
export const workoutTypeSchema = z.enum([
  'EASY',
  'INTERVAL',
  'TEMPO',
  'LONG',
  'RECOVERY',
  'RACE',
  'STRENGTH',
  'WALK',
])
```

Usar o mesmo schema no contrato da API, Server Action e formulário.

## CT-05 — `VISITOR` mistura papel sintético e papel persistível

Localização:

- `packages/auth/src/roles.ts#L1-L12`
- `apps/api/src/http/middlewares/auth.ts#L49-L75`
- `apps/api/src/http/routes/invites/create-invite.ts#L113-L119`
- `apps/api/prisma/schema.prisma#L325-L332`

`VISITOR` é um estado sintético de autorização, não um papel persistido. Atualmente ele faz parte do `roleSchema` usado por convites, mas não existe no Prisma.

Correção:

```ts
const persistedRoleSchema = z.enum([
  'OWNER',
  'MANAGER',
  'ADMIN',
  'ATHLETE',
  'COACH',
  'BILLING',
])

const authorizationRoleSchema = z.union([
  persistedRoleSchema,
  z.literal('VISITOR'),
])
```

## CT-06 — Criação de clube descarta slug e descrição

Localização:

- Formulário: `apps/web/src/app/(app)/create-club/create-club-form.tsx#L40-L68`
- Action: `apps/web/src/app/(app)/create-club/actions.ts#L6-L15`
- API: `apps/api/src/http/routes/clubs/create-club.ts#L21-L30`

O formulário permite editar slug e descrição, os adiciona ao `FormData`, mas a Action repassa apenas `name`. A UI retorna sucesso mesmo com os valores ignorados.

Correção: ou persistir/validar ambos, ou remover os campos da UI até serem suportados.

## CT-07 — Rota de estatísticas não registrada

Localização:

- `apps/api/src/http/routes/workouts/get-my-stats.ts#L8-L29`
- `apps/api/src/http/server.ts#L159-L166`

`getMyStats` existe, mas não é importado/registrado. Resultado: 404 e código morto.

Correção: registrar a rota e criar teste `app.inject`, ou remover o handler se não houver consumidor.

## CT-08 — Erro de inscrição em corrida é sempre mascarado

Localização:

- `apps/web/src/app/(app)/[slug]/races/races-client.tsx#L134-L146`

Atual:

```ts
error?.response?.json?.message
```

`json` é função. Correto:

```ts
if (error instanceof HTTPError) {
  const body = await error.response.json<{ message?: string }>()
  toast.error(body.message ?? 'Erro ao processar inscrição.')
}
```

Centralizar isso em `parseApiError(error: unknown)`.

## CT-09 — Pace formatado incorretamente

Localização:

- `apps/web/src/app/(app)/[slug]/members/member-grid.tsx#L180-L195`

`5.50 min/km` significa 5 minutos e 30 segundos, não `5:50`.

Formatter correto:

```ts
export function formatPace(paceMinutes: number | null) {
  if (!paceMinutes || paceMinutes <= 0) return '--:--'

  let minutes = Math.floor(paceMinutes)
  let seconds = Math.round((paceMinutes - minutes) * 60)

  if (seconds === 60) {
    minutes += 1
    seconds = 0
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
```

## CT-10 — Unidade de distância inconsistente

Há telas que tratam o total retornado pela API como quilômetros e outras que dividem o mesmo valor por 1000. Renomear contratos para incluir unidade:

```ts
totalDistanceKm: number
durationSeconds: number
paceMinutesPerKm: number | null
```

Nunca usar nomes genéricos como `distance` em DTO agregado sem documentar unidade.

## CT-11 — Política de cache inconsistente

Leituras de corrida definem tags, mas mutações usam somente `revalidatePath` ou `router.refresh`. Não há invalidação consistente das tags.

Escolher uma estratégia:

1. Dados privados e altamente mutáveis: `cache: 'no-store'`.
2. Cache deliberado: tags nomeadas e `revalidateTag` em todas as mutações.

Não adicionar timestamp à URL para burlar cache; isso também impede deduplicação.

## CT-12 — Autorização médica usa o usuário errado

Localização:

- `apps/api/src/http/routes/users/get-user-profile.ts#L65-L109`
- `apps/api/src/http/routes/users/get-user-profile.ts#L239-L271`

A rota diferencia proprietário pelo `currentUserId`, mas, ao decidir se libera condições médicas, usa `user.isSystemAdmin`, onde `user` é o perfil consultado. Assim, consultar o perfil de um system admin pode liberar os dados médicos desse perfil para outro usuário autenticado.

Correção:

- carregar privilégio/membership do solicitante separadamente;
- nunca derivar autorização dos atributos do recurso-alvo;
- mover dados médicos para endpoint específico com permissão dedicada e audit log.

## CT-13 — Edição parcial pode reabrir perfil privado

Localização:

- API: `apps/api/src/http/routes/users/get-user-profile.ts#L32-L53`
- Web: `apps/web/src/components/update-profile-modal.tsx#L60-L79`
- Web: `apps/web/src/components/update-profile-modal.tsx#L124-L146`

O DTO de leitura não devolve `isPublic`. O modal assume um default público e envia o estado completo ao salvar outros campos. Um perfil privado pode ser alterado para público sem intenção explícita.

Correção:

- incluir `isPublic` no DTO privado do proprietário;
- nunca incluí-lo no DTO público quando não necessário;
- enviar PATCH apenas com campos realmente alterados;
- adicionar teste: alterar avatar não modifica privacidade.

---

# 2. Qualidade de código e TypeScript

## Métricas confirmadas em código de produção

Excluídos specs, `node_modules`, generated, dist, scratch e `.next`.

| Métrica | Quantidade |
|---|---:|
| Declarações tipadas com `any` | 46 |
| Casts `as any` | 42 |
| Chamadas `z.any()` | 16 |
| Catches vazios | 4 |
| Suppressões `@ts-ignore`/`@ts-expect-error` | 1 |
| Linhas em código TS/TSX de produção analisado | Aproximadamente 34,8 mil |

`biome.json` desabilita `noExplicitAny`, permitindo que o problema cresça.

## CQ-01 — Estratégia para remover `any`

Não ativar `noExplicitAny: error` globalmente de uma vez, pois o repositório já possui grande backlog.

Sequência:

1. Alterar para `warn`.
2. Bloquear novos `any` em arquivos alterados no CI.
3. Corrigir boundaries primeiro: Actions, DTOs, erros HTTP e CASL.
4. Trocar `any` por `unknown` + narrowing.
5. Ativar `error` por diretório quando zerado.

Exemplo de erro HTTP:

```ts
function isHttpError(error: unknown): error is HTTPError {
  return error instanceof HTTPError
}
```

Para Prisma:

```ts
const where: Prisma.RankingWhereInput = { ... }
```

## CQ-02 — `z.any()` em objetos complexos

Ocorrências principais:

- `routeData` de treino/corrida;
- resposta de workouts;
- role/status de membros pendentes;
- payload de audit log.

GeoJSON deve ter schema próprio. Para JSON arbitrário de auditoria, usar `z.unknown()` no boundary e uma estrutura serializável explícita internamente.

## CQ-03 — Componentes excessivamente grandes

Maiores arquivos de produção:

| Arquivo | Linhas |
|---|---:|
| `profile/profile-client.tsx` | 1.332 |
| `[slug]/settings/settings-client.tsx` | 1.076 |
| `[slug]/dashboard/dashboard-client.tsx` | 994 |
| `[slug]/members/members-client.tsx` | 816 |
| `landing-page.tsx` | 721 |
| `workout-card.tsx` | 670 |
| `reports/reports-client.tsx` | 652 |
| `update-profile-modal.tsx` | 639 |
| `profile-share-modal.tsx` | 569 |
| `checkout-client.tsx` | 558 |

Problemas observados:

- autorização visual misturada com renderização;
- vários modais e estados no mesmo componente;
- chamadas HTTP diretas;
- formatadores duplicados;
- cálculo de entitlement no browser;
- baixa testabilidade.

Estratégia incremental:

```text
features/profile/
  api.ts
  actions.ts
  schemas.ts
  formatters.ts
  hooks/
  components/
```

Não fazer big-bang. Extrair primeiro funções puras, depois modais, depois hooks de orquestração.

## CQ-04 — Boundary server/client misturado

`apps/web/src/http/api-client.ts` decide em runtime se lê `next/headers` ou cookie no browser. Isso:

- dificulta tree-shaking e análise de boundary;
- obriga JWT acessível a JavaScript;
- espalha tratamento de CORS e auth.

Estrutura sugerida:

```text
apps/web/src/lib/api/
  server.ts  # import 'server-only', cookies HttpOnly
  public.ts  # chamadas realmente públicas do browser
```

Chamadas privadas devem ocorrer em Server Components, Actions ou Route Handlers.

## CQ-05 — `packages/env` mistura três runtimes

Atualmente `@saas/env` contém:

- segredo da API;
- segredo server-side do Next;
- variável pública do browser.

E usa `@t3-oss/env-nextjs` também na API Fastify.

Estrutura recomendada:

```text
apps/api/src/config/env.ts
apps/web/src/env/server.ts
apps/web/src/env/client.ts
```

Somente helpers pequenos devem ser compartilhados.

## CQ-06 — Packages source-only frágeis

`packages/auth` e `packages/env` apontam `main/types` para `.ts`, sem `exports`, build ou `check-types`. A API compensa com `noExternal` no tsup.

Mínimo recomendado:

- adicionar `exports`;
- adicionar `check-types`;
- modelar no Turbo a dependência de source packages;
- criar build próprio apenas se os packages forem publicados ou crescerem.

## CQ-07 — Bootstrap da API

`apps/api/src/http/server.ts` mistura:

- criação Fastify;
- plugins;
- CORS/rate limit;
- storage local;
- Swagger;
- import/registro de todas as rotas;
- `listen()`.

Divisão mínima:

```text
http/app.ts       # cria e configura app
http/routes.ts    # registradores por domínio
http/server.ts    # somente listen/shutdown
```

Cada domínio existente recebe `index.ts` para registrar suas rotas.

## CQ-08 — Naming e resíduos

Exemplos:

- package web chamado `--turbo`;
- namespace genérico `@saas/*`;
- `getMemberShip`, `getClubDashBoard`, `getClubeRanking`;
- `error-handle.ts` exportando `errorHandler`;
- augmentation Fastify duplicada em `apps/api/@types` e `apps/api/src/@types`;
- `inviteSubject` duplicado em `packages/auth/src/index.ts`.

Corrigir naming ao tocar nos módulos, exceto o package `--turbo`, que deve ser normalizado cedo.

---

# 3. Arquitetura de contratos

## Package recomendado

```text
packages/contracts/
  src/
    common/
      role.ts
      pagination.ts
      units.ts
    auth.ts
    clubs.ts
    members.ts
    races.ts
    workouts.ts
```

Começar somente pelos contratos com drift:

1. `PersistedRole` e `AuthorizationRole`.
2. `MemberDto`.
3. `ProfileDto`.
4. `WorkoutType` e update/create requests.
5. `RankingDto`.

Datas transportadas em JSON devem ser strings ISO nos contratos compartilhados. `z.date()` representa objeto interno, não payload HTTP serializado.

Exemplo:

```ts
export const memberDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  role: persistedRoleSchema,
  email: z.email().nullable(),
  joinedAt: z.iso.datetime(),
})

export type MemberDto = z.infer<typeof memberDtoSchema>
```

Alternativa futura: gerar client OpenAPI a partir do Swagger. Não combinar geração e package manual para o mesmo endpoint sem definir uma única fonte de verdade.

---

# 4. Organização-alvo pragmática

```text
apps/
  api/
    src/
      config/env.ts
      http/
        app.ts
        server.ts
        plugins/
        routes/
          clubs/index.ts
          members/index.ts
          races/index.ts
          workouts/index.ts
      services/
      lib/

  web/
    src/
      env/
        client.ts
        server.ts
      features/
        clubs/
        members/
        races/
        workouts/
        profile/
      lib/api/
        server.ts
        public.ts
      components/
        ui/
        shared/

packages/
  contracts/
  permissions/

config/
  typescript-config/
```

Não criar agora packages genéricos de `utils`, `domain`, `database` ou `ui` sem segundo consumidor real.

---

# 5. Priorização desta revisão

## P0 — Antes de qualquer refatoração ampla

1. Atualizar dependências críticas descritas no plano de dependências.
2. Corrigir `Member.email` nullable.
3. Separar `VISITOR` de papel persistível.
4. Corrigir `WorkoutType` no update.
5. Corrigir `auth()` e o tratamento de redirect/cookie já apontado na auditoria principal.
6. Executar typecheck real da API.

## P1 — Junto da Fase 1

1. Criar `packages/contracts` com os primeiros cinco contratos.
2. Corrigir profile DTO e birthDate.
3. Separar API server-only no Next.
4. Eliminar token das props/client.
5. Padronizar erros HTTP e Server Actions.
6. Corrigir formatadores de unidades.

## P2 — Organização incremental

1. Separar env por runtime.
2. Extrair `app.ts`/`server.ts` da API.
3. Dividir componentes gigantes por feature.
4. Adicionar `exports` e typecheck aos packages.
5. Migrar Biome 1 para Biome 2 em PR isolado.
6. Remover dependências redundantes/depreciadas.

## Validações executadas

- `pnpm outdated -r` — executado; encontrou atualizações patch/minor e majors.
- `pnpm audit --prod` — executado; 120 ocorrências reportadas.
- `pnpm audit --prod --json` — executado para consolidar advisories.
- Métricas de `any`, `z.any`, catches vazios e tamanhos — executadas excluindo dependências/artefatos.
- Nenhuma dependência foi atualizada nesta etapa.
- Nenhum arquivo de código foi alterado.
