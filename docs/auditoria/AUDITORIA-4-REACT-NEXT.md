# Auditoria 4 — Melhores Práticas React 19 e Next.js 16

Data da revisão: 2026-08-08.

## Escopo

Revisão de `apps/web` com foco em:

- React 19 e Rules of Hooks;
- Next.js 16 App Router;
- Server/Client Components;
- Server Actions e Route Handlers;
- data fetching, cache, revalidation e streaming;
- estado derivado, effects, cleanup e concorrência;
- imagens, fontes, metadata e bundles;
- acessibilidade e formulários;
- navegação e tratamento de erros.

A stack recomendada permanece:

- React 19;
- Next.js App Router;
- pnpm;
- Biome como única ferramenta de lint/formatação;
- Zod para contratos/boundaries.

Não é recomendada a introdução de Redux, ESLint, Prettier ou outra camada global sem necessidade concreta.

## Resumo executivo

O frontend utiliza corretamente App Router, Server Components em várias páginas, `next/font` e carregamento dinâmico do Mapbox. Porém, os limites Client Component são muito amplos e há bugs React reais, não apenas oportunidades de otimização.

Achados prioritários:

1. `AthleteDetailsModal` viola as Rules of Hooks e pode quebrar ao abrir.
2. Botão de remover imagem pode submeter o formulário inteiro.
3. Requisições assíncronas de corrida/cidade/admin podem chegar fora de ordem e sobrescrever estado atual.
4. Timers de checkout/verificação continuam executando depois da desmontagem.
5. Não existem `loading.tsx`, `error.tsx` ou `not-found.tsx`.
6. Token JWT atravessa Server Component → Client Component.
7. Páginas inteiras são grandes Client Components, elevando serialização, hidratação e bundles.
8. Modais manuais não possuem semântica/focus management adequado.
9. Existem botões dentro de links e controles sem nome acessível.
10. Banners e imagens de corrida não usam o pipeline do `next/image`.

## Matriz dos achados

| ID | Severidade | Área | Achado |
|---|---|---|---|
| RN-01 | Crítica | Hooks | Retorno condicional antes de `useMemo` em `AthleteDetailsModal` |
| RN-02 | Alta | Formulário | Botão de remover imagem dispara submit |
| RN-03 | Alta | Concorrência | Respostas assíncronas antigas sobrescrevem entidade/filtro atual |
| RN-04 | Alta | Effects | Timers continuam após unmount e executam efeitos de negócio |
| RN-05 | Alta | Estado | Premium usa localStorage/cookie manipulável como autoridade |
| RN-06 | Alta | Estado | Feed sincroniza dados, mas não reinicializa paginação |
| RN-07 | Alta | HTML/A11y | Botões interativos aninhados em `Link`/`a` |
| RN-08 | Alta | A11y | Modais manuais sem dialog semantics/focus trap |
| NX-01 | Alta | Boundary | JWT serializado de Server para Client Component |
| NX-02 | Média | App Router | Server Actions sem auth/Zod na própria fronteira |
| NX-03 | Média | Navegação | `redirect()` engolido por catch genérico |
| NX-04 | Média | UX/Streaming | Ausência de loading/error boundaries e Suspense por seção |
| NX-05 | Média | RSC/Bundle | Client Components excessivamente amplos |
| NX-06 | Média | Data fetching | Header e ClubSwitcher repetem fetch no browser |
| NX-07 | Média | Cache | Invalidação do layout raiz é excessivamente ampla |
| NX-08 | Média | 404 | Recursos inexistentes não usam `notFound()` |
| NX-09 | Média | Imagens | Imagens relevantes não usam `next/image`/rendições |
| NX-10 | Média | Metadata | Metadata global duplicada e páginas privadas sem `noindex` explícito |
| UX-01 | Média | A11y | Inputs sem label associado/autocomplete/inputMode |
| UX-02 | Média | A11y | Botões somente com ícone sem nome acessível |
| UX-03 | Média | Hydration | Datas dependem do timezone/relógio do SSR e browser |
| UX-04 | Média | Responsive | Modais de compartilhamento podem ser cortados em mobile |
| PF-01 | Alta | Bundle | Recharts, html-to-image e modais fechados no bundle inicial |
| PF-02 | Baixa | Fontes | Public Sans é preloaded sem uso confirmado |
| PF-03 | Baixa | React 19 | Hook próprio poderia usar `useActionState`/`useFormStatus` |

---

# 1. Bugs React que devem ser corrigidos primeiro

## RN-01 — Violação das Rules of Hooks

Localização:

- `apps/web/src/components/athlete-details-modal.tsx#L82-L145`
- uso: `apps/web/src/app/(app)/[slug]/dashboard/reports/reports-client.tsx#L641-L645`

Atual:

```tsx
if (!isOpen || !athlete) return null

const athleteCompleted = useMemo(...)
const stats = useMemo(...)
const paceHistoryData = useMemo(...)
const plannedRecent = useMemo(...)
```

Fechado, o componente executa zero hooks. Aberto, executa quatro. Se permanece montado e `isOpen` muda, React pode lançar:

```text
Rendered more hooks than during the previous render
```

Correção preferencial:

```tsx
export function AthleteDetailsModal(props: AthleteDetailsModalProps) {
  if (!props.isOpen || !props.athlete) return null

  return <AthleteDetailsModalContent {...props} athlete={props.athlete} />
}

function AthleteDetailsModalContent({ athlete, ...props }: ContentProps) {
  const athleteCompleted = useMemo(...)
  // hooks sempre executados neste componente montado
}
```

Existe padrão semelhante, atualmente latente, em `profile-button.tsx`: retorno por `!user` antes dos hooks, embora o tipo declare usuário obrigatório.

## RN-02 — Remover imagem submete formulário

Localização:

- `apps/web/src/components/image-upload.tsx#L74-L86`
- consumidores em formulários de perfil/configurações.

O botão não possui `type`; dentro de form o default é `submit`.

Correção:

```tsx
<button
  type="button"
  aria-label="Remover imagem"
  onClick={() => onChange('')}
>
```

Adicionar teste de interação: remover imagem não dispara a Server Action do formulário.

## RN-03 — Respostas assíncronas fora de ordem

Casos confirmados:

- corrida antiga pode preencher modal de outra corrida: `update-race-modal.tsx#L82-L117`;
- busca de cidades/geocoding: `create-race-modal.tsx#L95-L133` e `update-race-modal.tsx#L139-L177`;
- cidades em settings: `settings-client.tsx#L226-L254`;
- logs administrativos: `logs-client.tsx#L90-L138`;
- paginação de feedback/waitlist.

`startTransition` muda prioridade; não cancela request e não garante ordem.

Padrão recomendado:

```tsx
useEffect(() => {
  const controller = new AbortController()
  const requestId = ++latestRequest.current

  loadData({ signal: controller.signal }).then((result) => {
    if (requestId === latestRequest.current) {
      setData(result)
    }
  })

  return () => controller.abort()
}, [dependency])
```

Se o client HTTP não propaga `signal`, usar ao menos sequence/ref “latest wins”.

## RN-04 — Timers sem cleanup

Casos:

- checkout: `checkout-client.tsx#L122-L172`;
- verificação de e-mail: `verify-email-form.tsx#L18-L35` e `#L90-L124`.

No checkout, timers podem executar `subscribeAthlete`, `requestJoinClub` e `router.push` após o usuário sair da tela.

Correção:

- substituir delays por fluxo async server-side real;
- se delay visual permanecer, guardar timer em ref e limpar no unmount;
- nunca programar efeito de negócio com timer de apresentação;
- usar AbortController/cancel flag.

## RN-05 — Estado premium no browser

Localização:

- `checkout-client.tsx#L136-L147`;
- `explore-clubs-client.tsx#L41-L89`;
- `dashboard-client.tsx#L260-L276`;
- sincronizadores de sessão.

`localStorage` e cookie manipulável não podem controlar entitlement. Mesmo após falha da API, o cliente grava premium.

Correção:

- autoridade sempre no servidor;
- não enviar dados premium quando sem entitlement;
- estado local apenas como cache visual, nunca como permissão;
- invalidar/atualizar RSC após confirmação server-side.

## RN-06 — Feed e paginação divergem após refresh

Localização:

- `dashboard-client.tsx#L108-L110`;
- `dashboard-client.tsx#L311-L314`.

Quando `initialFeed` muda, apenas `feed` é atualizado. `page` e `hasMore` continuam referentes ao conjunto anterior.

Correção:

```tsx
useEffect(() => {
  setFeed(initialFeed)
  setPage(1)
  setHasMore(initialTotalPages > 1)
}, [club.slug, initialFeed, initialTotalPages])
```

Alternativa: remount controlado por `key={club.slug}`.

---

# 2. Next.js App Router

## NX-01 — Boundary Server/Client expõe JWT

Localização:

- cookie: `app/auth/sign-in/actions.tsx#L27-L35`;
- callback: `app/api/auth/callback/route.ts#L22-L26`;
- cliente universal: `src/http/api-client.ts#L4-L25`;
- token passado a componentes client, como settings/upload.

O token entra no payload RSC e heap do browser.

Estrutura-alvo:

```text
src/lib/api/server.ts  # import 'server-only', lê cookie HttpOnly
src/lib/api/public.ts  # apenas endpoints realmente públicos
```

Mutações e uploads privados passam por Server Actions ou Route Handlers BFF.

## NX-02 — Server Actions devem ser tratadas como endpoints

Actions de membro, settings, treino e corrida recebem IDs/roles/payloads diretamente e dependem integralmente da API para segurança.

Cada Action deve:

1. autenticar;
2. validar input com Zod;
3. verificar autorização/tenant quando viável;
4. chamar a API, que repete a autorização;
5. normalizar erro;
6. invalidar somente o necessário.

TypeScript no cliente não valida chamadas diretas à Action.

## NX-03 — `redirect()` capturado

Localização: `apps/web/src/auth/auth.ts#L9-L36`.

No Next, `redirect()` lança uma exceção de controle. Um catch vazio pode capturar `NEXT_REDIRECT`.

Correção:

- capturar somente `HTTPError` esperado;
- executar redirect fora do catch;
- separar `requireUser()` de `getOptionalUser()`;
- usar `unstable_rethrow` quando um catch amplo for inevitável.

## NX-04 — Ausência de loading/error/not-found

Não foram encontrados:

- `loading.tsx`;
- `error.tsx`;
- `global-error.tsx`;
- `not-found.tsx`.

O dashboard aguarda oito requests antes de renderizar. Falha em um deles derruba a rota inteira.

Implementação incremental:

```text
app/(app)/loading.tsx
app/(app)/error.tsx
app/(app)/[slug]/not-found.tsx
app/(app)/[slug]/dashboard/loading.tsx
```

Dividir dashboard em Server Components assíncronos independentes sob Suspense:

```tsx
<Suspense fallback={<MetricsSkeleton />}>
  <DashboardMetrics />
</Suspense>
<Suspense fallback={<FeedSkeleton />}>
  <WorkoutFeed />
</Suspense>
```

## NX-05 — Client boundaries grandes

Exemplo: o Server Component do dashboard faz todas as leituras, mapeia os dados e envia tudo para um `DashboardClient` de quase mil linhas.

Impactos:

- payload RSC grande;
- hidratação de conteúdo que poderia ser HTML server-rendered;
- bibliotecas/modais no grafo inicial;
- rerender amplo por pequenos estados locais.

Regra recomendada:

- Server Components para shell, cards, listas e dados;
- Client Components pequenos para filtros, modal aberto, formulário e controles;
- não transformar página inteira em client apenas porque uma seção é interativa.

## NX-06 — Header e ClubSwitcher repetem fetch

Localização:

- `components/header.tsx#L50-L75`;
- `components/club-switcher.tsx#L18-L53`.

Ambos chamam `getClubs()` no browser. O switcher usa `window.location.reload()`.

Correção:

- buscar clubes no layout Server Component uma vez;
- passar DTO mínimo ao header/switcher;
- usar props ou contexto pequeno apenas se houver múltiplos consumidores;
- substituir reload por navegação/refresh controlado.

## NX-07 — Revalidation ampla

`revalidatePath('/', 'layout')` invalida árvore muito maior do que a entidade alterada.

Enquanto dados privados continuarem uncached, usar paths específicos. Para cache público/estável, adotar tags por entidade:

```text
club:<slug>
workouts:<slug>
profile:<id>
```

Não cachear payload personalizado por usuário sem separação explícita.

## NX-08 — 404 sem `notFound()`

Recursos dinâmicos ausentes redirecionam `/` ou propagam erro. Usar `notFound()` para respostas 404 da API e criar `not-found.tsx`. Isso preserva status correto e adiciona `noindex` automaticamente.

---

# 3. Performance e bundles

## PF-01 — Bibliotecas pesadas no bundle inicial

Build de produção observado:

| Client Component | Chunks associados sem compressão | Estimativa gzip |
|---|---:|---:|
| `profile-client` | 1.074 KB | 295 KB |
| `reports-client` | 840 KB | 230 KB |
| `dashboard-client` | 633 KB | 170 KB |
| `races-client` | 604 KB | 159 KB |
| `members-client` | 539 KB | 147 KB |
| `ranking-client` | 467 KB | 124 KB |

Os valores incluem chunks compartilhados e não equivalem necessariamente a transferência exclusiva por rota, mas indicam o peso associado aos boundaries.

Causas:

- Recharts importado estaticamente;
- vários modais fechados importados na página;
- `html-to-image` no topo dos modais;
- perfil inteiro como Client Component.

Correções:

```tsx
const EvolutionChart = dynamic(() => import('./evolution-chart'), {
  loading: () => <ChartSkeleton />,
})
```

```ts
const { toJpeg } = await import('html-to-image')
```

Carregar modal apenas quando aberto e mover conteúdo não interativo para Server Components.

Ponto positivo: Mapbox já está isolado com `dynamic(..., { ssr: false })`.

## NX-09 — Imagens

`<img>` é usado em banner, imagens de corrida e listas de participantes. `next.config.ts` não possui `remotePatterns`.

Prioridades:

1. Banner/LCP e capa de corrida com `next/image`.
2. Definir `sizes` real.
3. Configurar somente hosts de storage permitidos.
4. Usar `priority`/preload apenas se a medição confirmar LCP.
5. Avatares com dimensões explícitas e alt obrigatório/decorativo.
6. QR/data URL pequenos podem continuar como img com width/height.

## PF-02 — Fonte sem uso

`Public Sans` é carregada como variável, mas `font-display` não possui uso confirmado. Remover até que seja usada ou aplicá-la deliberadamente. Isso evita preload aproximado desnecessário.

---

# 4. Acessibilidade e HTML

## RN-07 — Interativos aninhados

Cards de corrida usam `Link` envolvendo botões de editar/excluir/inscrever. `preventDefault()` não corrige HTML semântico inválido.

Correção:

- link no título/CTA;
- botões como irmãos;
- stretched link visual sem envolver controles.

Logout possui `<a><button>`. Migrar para form/Server Action POST ou um único link estilizado enquanto o fluxo ainda for GET.

## RN-08 — Modais manuais

Diversos modais usam overlay `<div>` sem:

- `role="dialog"`;
- `aria-modal`;
- title/description associados;
- focus trap;
- foco inicial/retorno;
- Escape;
- isolamento do conteúdo externo.

O projeto já possui Radix Dialog. Migrar os modais manuais para esse componente em vez de reimplementar foco/acessibilidade.

## UX-01 — Labels e autocomplete

Não foi encontrado `autoComplete` nos formulários.

Adicionar:

- login: `username`, `current-password`;
- cadastro/reset: `name`, `username`, `email`, `new-password`;
- cartão: `cc-name`, `cc-number`, `cc-exp`, `cc-csc`;
- `inputMode="numeric"` para número/validade/CVC;
- `aria-invalid` e `aria-describedby` para erros.

Todo input precisa de `id` + `htmlFor` ou label `sr-only`.

## UX-02 — Botões sem nome acessível

Botões de editar, excluir, copiar e menus de ícone precisam de `aria-label`. Menus customizados devem declarar `aria-expanded`, `aria-haspopup` e responder a Escape; preferir Radix DropdownMenu já instalado.

`AvatarImage` deve exigir `alt` ou uma prop `decorative`.

## UX-03 — Datas e hydration

`new Date()` e `toLocaleDateString()` em Client Components podem produzir HTML diferente entre timezone do servidor e browser.

Correção:

- serializar `initialToday` no Server Component;
- definir timezone oficial, como `America/Sao_Paulo`, para apresentação;
- usar UTC para chaves internas;
- formatar no servidor quando não depende da localidade do usuário.

## UX-04 — Mobile

Cards de compartilhamento possuem dimensões fixas maiores que o espaço interno de diálogos de 320 px e podem ser cortados. Usar preview responsivo, scroll vertical e manter canvas fixo separado apenas para exportação.

---

# 5. Metadata e SEO

Metadata atual:

```ts
title: 'ClubRun | ClubRun'
```

Recomendação root:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: 'ClubRun',
    template: '%s | ClubRun',
  },
  description: '...',
}
```

Adicionar:

- metadata específica para páginas públicas;
- `generateMetadata()` para clube/perfil/prova públicos;
- `robots: { index: false, follow: false }` em área autenticada, auth, checkout e URLs com tokens;
- `robots.ts`, `sitemap.ts`, `manifest.ts`, ícones e Open Graph.

Evitar dupla busca entre metadata e página; compartilhar leitura memoizada quando apropriado.

---

# 6. React 19

## PF-03 — `useActionState`

O hook próprio `useFormState` funciona, mas reimplementa estado/action com `useTransition` e `preventDefault`.

Migrar gradualmente para:

- `useActionState`;
- `<form action={formAction}>`;
- `useFormStatus` no botão;
- progressive enhancement.

Não é hotfix. Priorizar formulários novos ou já sendo refatorados.

## Memoização

Não adicionar `useMemo`, `useCallback` ou `React.memo` em massa.

Casos úteis:

- agregações de treino/relatório;
- filtro/ordenação de membros em componente de 800 linhas.

Casos desnecessários:

- busca em array pequeno de temas;
- formatação de dois números;
- handlers triviais sem child memoizado.

---

# 7. Ordem recomendada

## Hotfix React

1. Corrigir `AthleteDetailsModal` e qualquer retorno condicional antes de hooks.
2. Adicionar `type="button"` no remove de imagem.
3. Corrigir cleanup dos timers.
4. Adicionar latest-request-wins/AbortController aos modais e filtros.
5. Corrigir feed/paginação.
6. Remover interativos aninhados.

## Próximo deploy

1. Adicionar `loading.tsx`, `error.tsx` e `not-found.tsx`.
2. Corrigir `auth()`/redirect.
3. Autenticar/validar Server Actions.
4. Buscar clubes uma vez no layout.
5. Migrar modais manuais para Radix.
6. Corrigir labels, autocomplete, alt e foco.
7. Migrar banners/capas para `next/image`.

## Refatoração incremental

1. Dividir Client Components grandes por feature/section.
2. Lazy-load Recharts, html-to-image e modais.
3. Mover conteúdo estático/listas para Server Components.
4. Adotar tags/cache somente onde houver benefício medido.
5. Migrar formulários para `useActionState` quando tocados.
6. Completar metadata/SEO/noindex.

## Critérios de conclusão

- Nenhuma violação de Rules of Hooks.
- Nenhum efeito assíncrono atualiza estado de entidade antiga.
- Nenhum timer de negócio sobrevive ao unmount.
- Loading/error/not-found disponíveis nas rotas críticas.
- JWT não atravessa para Client Components.
- Modais têm semântica e foco corretos.
- Bundle de perfil/relatórios reduzido e medido.
- Banners/capas usam dimensões/rendições apropriadas.
- Formulários possuem labels/autocomplete/erros associados.

## Validação

- Revisão estática dos arquivos React/Next.
- `tsc --noEmit` do Web havia passado na auditoria anterior.
- Um build Next de produção foi executado durante esta revisão e concluiu compilação, TypeScript e geração das páginas com sucesso.
- O build regenerou somente `apps/web/.next`, que está ignorado pelo Git.
- Nenhum arquivo-fonte foi alterado nesta auditoria.
