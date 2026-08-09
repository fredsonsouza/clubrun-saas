# Fase 5 — Infraestrutura, CI/CD e Observabilidade

## Objetivo

Transformar validações hoje manuais ou inexistentes em gates automáticos e tornar a operação da VPS previsível.

## 5.1 Runtime e workspaces

Checklist:

- [ ] Fixar versão Node compatível com Next 16 e Prisma em `.nvmrc`, `engines` e imagem/runtime da VPS.
- [ ] Renomear o pacote web de `--turbo` para nome estável, por exemplo `@clubrun/web`.
- [ ] Adicionar `check-types: "tsc --noEmit"` a API, web e pacotes.
- [ ] Corrigir todos os erros TypeScript da API.
- [ ] Remover `any` gradualmente e reativar `noExplicitAny` por diretório.
- [ ] Separar lint de código gerado/artefatos.

## 5.2 Pipeline obrigatório

Pipeline recomendado:

```text
install frozen lockfile
→ lint
→ typecheck
→ testes unitários
→ testes de autorização/multi-tenant
→ testes E2E em PostgreSQL isolado
→ build
→ backup/restore check
→ prisma migrate deploy
→ deploy
→ smoke test
```

O CI deve falhar se qualquer workspace não declarar a tarefa esperada; zero tarefas não pode ser considerado sucesso.

## 5.3 Ambiente e segredos

Problemas atuais a corrigir:

- `SKIP_ENV_VALIDATION="false"` é interpretado como verdadeiro por `!!string`.
- `SERVER_PORT` é validado, mas `PORT` é usado.
- URLs têm fallback localhost, inclusive em produção.
- `JWT_SECRET` aceita qualquer string.

Checklist:

- [ ] Parsear boolean com enum explícito.
- [ ] Usar uma única variável de porta.
- [ ] Proibir defaults localhost em produção.
- [ ] Validar entropia/comprimento de segredo JWT.
- [ ] Separar env de API e web para impedir import acidental de server secrets no cliente.
- [ ] Rotação documentada de JWT/OAuth/e-mail/storage.
- [ ] Não imprimir env ou tokens em logs de deploy.

## 5.4 Migrations e deploy

Adicionar scripts separados:

```json
{
  "db:migrate:dev": "prisma migrate dev",
  "db:migrate:deploy": "prisma migrate deploy",
  "db:migrate:status": "prisma migrate status"
}
```

Checklist:

- [ ] Backup antes de migration de produção.
- [ ] Ensaiar em restore isolado.
- [ ] Healthcheck de API e DB.
- [ ] Estratégia forward-fix documentada.
- [ ] Nunca executar seed destrutivo automaticamente.
- [ ] Bloquear deploy se migration status estiver divergente.

## 5.5 Headers e reverse proxy

Configurar no Fastify e/ou proxy confiável:

- CORS allowlist;
- HSTS somente com HTTPS corretamente configurado;
- `X-Content-Type-Options: nosniff`;
- CSP, especialmente para Swagger e mídia;
- `Referrer-Policy`;
- framing policy (`frame-ancestors`/`X-Frame-Options`);
- limite de body no proxy e aplicação;
- timeout de request/upload;
- Swagger restrito ou desabilitado em produção.

Configurar `trustProxy` apenas para os proxies reais, nunca de forma irrestrita sem entender a topologia.

## 5.6 Graceful shutdown e pool

Checklist:

- [ ] Tratar `SIGTERM` e `SIGINT`.
- [ ] Parar de aceitar novas conexões.
- [ ] Aguardar requests/transações em andamento até timeout.
- [ ] Executar `app.close()`.
- [ ] Executar `pool.end()` uma única vez.
- [ ] Definir limites do pool por processo.
- [ ] Monitorar conexões ativas/idle/waiting.

## 5.7 Logs e observabilidade

Requisitos:

- Logs estruturados JSON.
- Correlation/request ID.
- Redaction de Authorization, cookies, senha, token, e-mail, dado médico e GeoJSON.
- Níveis configuráveis por ambiente.
- Sem query logging integral em produção por padrão.
- Métricas de latência, erro, pool, DB, disco, upload e fila de e-mail.
- Alertas para 5xx, disco, pool esgotado, falha de worker e crescimento anormal de auth failures.

Audit log crítico deve estar na transação ou outbox, não em `setImmediate` sem await.

## 5.8 Tratamento de erros

Padronizar envelope:

```ts
type ApiError = {
  code: string
  message: string
  incidentId?: string
  fieldErrors?: Record<string, string[]>
}
```

Semântica:

- 400: payload inválido.
- 401: ausente/inválido.
- 403: autenticado sem permissão.
- 404: inexistente ou ocultado por tenant.
- 409: conflito/transição concorrente.
- 413: payload excedido.
- 429: rate limit.
- 500: mensagem genérica e incident ID.

No Next.js:

- [ ] Criar `error.tsx` para segmentos autenticado/admin.
- [ ] Diferenciar 401 de 5xx em `auth()`.
- [ ] Não renderizar `JSON.stringify(error)`.
- [ ] Logout por POST/Server Action, não GET.

## 5.9 Política de dependências, pnpm e Biome

Checklist:

- [ ] Usar somente `pnpm` para instalação e scripts da monorepo.
- [ ] Fixar `packageManager` e gerenciá-lo via Corepack.
- [ ] Migrar pnpm 9 para a versão estável aprovada em PR isolado.
- [ ] CI usa `pnpm install --frozen-lockfile`.
- [ ] CI executa `pnpm audit --prod --audit-level high`.
- [ ] Renovate/Dependabot agrupa updates por ecossistema.
- [ ] Patch/minor de segurança tem SLA curto; major fica em PR isolado.
- [ ] Remover `@types/mapbox-gl`, que está depreciado.
- [ ] Não usar tags Docker `latest`; fixar versão/digest.

Biome permanece a única ferramenta de lint e formatação:

- [ ] Não adicionar ESLint ou Prettier.
- [ ] Migrar Biome 1.9.4 para 2.x em PR isolado.
- [ ] Executar `pnpm exec biome migrate --write` após o upgrade.
- [ ] Separar alteração de configuração, formatação massiva e mudanças funcionais.
- [ ] Elevar `noExplicitAny` primeiro para `warn` e depois para `error` por diretório.
- [ ] Bloquear novas suppressões TypeScript sem justificativa.

## 5.10 Práticas React 19 e Next.js 16

### App Router

- [ ] Criar `loading.tsx`, `error.tsx` e `not-found.tsx` nas rotas críticas.
- [ ] Dividir dashboard/relatórios em Server Components assíncronos com Suspense.
- [ ] Tratar 404 da API com `notFound()`.
- [ ] Não capturar exceção de controle de `redirect()`.
- [ ] Validar/autenticar Server Actions como endpoints públicos.
- [ ] Invalidar paths/tags específicos, não o layout raiz sem necessidade.
- [ ] Manter dados privados uncached ou segmentados explicitamente por usuário.

### React

- [ ] Biome/CI bloqueia violações das Rules of Hooks.
- [ ] Effects assíncronos usam AbortController ou latest-request-wins.
- [ ] Timers/listeners possuem cleanup.
- [ ] Estado derivado não é duplicado sem necessidade.
- [ ] Migrar formulários novos para `useActionState`/`useFormStatus` quando trouxer benefício.
- [ ] Não adicionar memoização em massa sem custo medido.

### Bundle e UX

- [ ] Lazy-load Recharts, `html-to-image` e modais fechados.
- [ ] Reduzir boundaries Client Component; manter conteúdo estático no servidor.
- [ ] Buscar clubes uma vez no layout, evitando fetch duplicado em Header/Switcher.
- [ ] Usar `next/image` em banners/capas e configurar hosts permitidos.
- [ ] Completar metadata, noindex privado, manifest/robots/sitemap conforme escopo público.
- [ ] Migrar modais manuais para Radix Dialog.
- [ ] Adicionar labels, autocomplete, alt, focus-visible e aria-labels.

Detalhes: [Auditoria 4 — React e Next](./AUDITORIA-4-REACT-NEXT.md).

## Critério de saída

- CI bloqueia lint/typecheck/test/build inválidos.
- Deploy executa migration segura e smoke test.
- Env inválido impede boot.
- API encerra graciosamente.
- Logs são úteis sem vazar PII/segredos.
- Alertas básicos da VPS estão ativos.
