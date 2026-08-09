# Plano de Dependências e Modernização Criptográfica

## Objetivo

Corrigir vulnerabilidades de supply chain e modernizar password hashing, tokens, JWT e criptografia de dados sensíveis sem realizar upgrades indiscriminados.

Todos os comandos usam **pnpm**, conforme o padrão do projeto. O lint e a formatação permanecem exclusivamente no **Biome**; não introduzir ESLint ou Prettier.

## 1. Estado atual das dependências

Comando executado:

```bash
pnpm audit --prod
```

Resultado:

| Severidade | Ocorrências reportadas |
|---|---:|
| Crítica | 4 |
| Alta | 45 |
| Moderada | 64 |
| Baixa | 7 |
| Total | 120 |

Esses números incluem advisories transitivos e repetição por caminhos de dependência. Nem todos são necessariamente alcançáveis pelo código em produção, mas os diretos e os presentes no caminho de autenticação devem ser corrigidos sem aguardar exploração.

## 2. Hotfix de dependências críticas

### 2.1 CASL

Atual:

```text
@casl/ability 6.7.3
```

Advisory:

```text
GHSA-x9vf-53q3-cvx6 — Prototype Pollution
corrigido em >= 6.7.5
```

Não é necessário migrar para CASL 7 imediatamente. Existe correção compatível na linha 6; a versão 6.8.1 foi confirmada no registry.

Comando sugerido:

```bash
pnpm --filter @saas/auth add @casl/ability@6.8.1
```

Depois:

```bash
pnpm --filter @saas/api test
pnpm --filter @saas/api exec tsc --noEmit
pnpm audit --prod
```

Apesar de as condições CASL atuais serem majoritariamente estáticas, uma biblioteca de autorização vulnerável não deve permanecer no caminho de produção.

### 2.2 JWT

Atual:

```text
@fastify/jwt 10.0.0
└── fast-jwt 6.1.0
```

Advisories críticos do `fast-jwt`:

- `GHSA-mvf2-f6gm-w987` — algorithm confusion;
- `GHSA-rp9m-7r4c-75qg` — cache confusion/claims de outro token;
- `GHSA-gmvf-9v4p-v8jc` — empty HMAC secret em resolver assíncrono.

`@fastify/jwt@10.2.1` foi confirmado com dependência `fast-jwt ^6.2.4`.

Comando sugerido:

```bash
pnpm --filter @saas/api add @fastify/jwt@10.2.1
```

Mesmo que alguns advisories dependam de configurações que o projeto não usa, o pacote vulnerável está na autenticação e deve ser atualizado.

### 2.3 Fastify

Atual: `5.6.2`. Latest observado: `5.11.3`.

Advisories incluem bypass de validação por `Content-Type` e DoS. Fazer update dentro do mesmo major:

```bash
pnpm --filter @saas/api add fastify@5.11.3
```

Atualizar plugins Fastify em lote compatível, não todos os majors simultaneamente.

### 2.4 Next.js

Atual: `16.0.8`. Latest observado: `16.3.0`.

Há advisories de Server Actions, RSC, DoS, cache e middleware. A versão atual está abaixo de várias versões corrigidas.

```bash
pnpm --filter ./apps/web add next@16.3.0 react@19.2.8 react-dom@19.2.8
```

Executar build e smoke tests das Server Actions, autenticação, uploads e páginas dinâmicas.

### 2.5 `@fastify/static`

Atual: `9.1.3`. Latest observado: `10.1.3`.

Há advisories de bypass/path traversal com versões corrigidas na linha 10. Como é major, atualizar em lote próprio e testar todas as URLs `/uploads`:

```bash
pnpm --filter @saas/api add @fastify/static@10.1.3
```

O ideal é remover o serving local quando object storage for implementado; até lá, o plugin deve permanecer corrigido.

## 3. Atualizações em lotes

### Lote A — Segurança imediata

```bash
pnpm --filter @saas/auth add @casl/ability@6.8.1
pnpm --filter @saas/api add @fastify/jwt@10.2.1 fastify@5.11.3
pnpm --filter ./apps/web add next@16.3.0 react@19.2.8 react-dom@19.2.8
pnpm install --lockfile-only
pnpm audit --prod
```

Não usar `pnpm update --latest -r` no primeiro lote.

### Lote B — Fastify plugins

Atualizar primeiro patches/minors compatíveis:

- `@fastify/cors`;
- `@fastify/multipart`;
- `@fastify/swagger`;
- `@fastify/jwt` já no lote A.

Majors em PR separado:

- `@fastify/static` 9 → 10;
- `@fastify/rate-limit` 10 → 11;
- `@fastify/swagger-ui` 5 → 6;
- `fastify-plugin` 5 → 6;
- `fastify-type-provider-zod` 6 → 7.

`fastify-type-provider-zod@7` foi confirmado como compatível com Fastify `^5.5.0`, Swagger `>=9.5.1` e Zod `>=4.1.5`, mas ainda deve ser migrado isoladamente.

### Lote C — Prisma/PostgreSQL

Atual: Prisma `7.1.0`; latest observado: `7.9.1`.

Atualizar todos os pacotes Prisma juntos:

```bash
pnpm --filter @saas/api add @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1
pnpm --filter @saas/api add -D prisma@7.9.1
pnpm --filter @saas/api exec prisma generate
pnpm --filter @saas/api exec tsc --noEmit
pnpm --filter @saas/api test
pnpm audit --prod
```

Os advisories de Hono aparecem transitivamente pelo tooling Prisma atual. A remoção precisa ser confirmada no audit pós-update, não presumida.

Não executar migration de produção apenas por atualizar o client; conferir changelog e gerar diff do schema.

### Lote D — Frontend/UI

Patches/minors podem ser agrupados de forma controlada:

- Radix;
- `react-map-gl`;
- `date-fns`;
- Mapbox;
- Recharts;
- `tailwind-merge`.

Majors isolados:

- `ky` 1 → 2;
- `motion` 12 → 13;
- `react-day-picker` 9 → 10;
- `lucide-react` 0.x → 1.x;
- CASL 6 → 7, se desejado futuramente.

Remover:

```bash
pnpm --filter ./apps/web remove @types/mapbox-gl
```

Esse pacote está depreciado porque `mapbox-gl` já fornece tipos.

### Lote E — Tooling

#### pnpm

O projeto fixa `pnpm@9.0.0`; a versão estável observada no registry é `11.20.0`.

Migrar em PR próprio e validar lockfile/CI:

```bash
corepack use pnpm@11.20.0
pnpm install
```

Se o ambiente da VPS/CI não estiver pronto para pnpm 11, atualizar primeiro para a última linha suportada internamente e programar o major.

#### Biome

Atual: `1.9.4`; latest observado: `2.5.7`.

Biome 2 é major e deve ter PR isolado:

```bash
pnpm add -Dw @biomejs/biome@2.5.7
pnpm exec biome migrate --write
pnpm exec biome check .
```

Revisar alterações de configuração. Não aplicar `--write` ao código inteiro junto com mudanças funcionais; separar migração de config, formatação e correções de lint.

#### TypeScript

O registry observado apresenta TypeScript 7, enquanto o projeto usa 5.9.2. Não migrar junto dos hotfixes. Manter 5.9 inicialmente e revisar TypeScript 7 somente após estabilizar Next/Prisma/tooling.

## 4. Política de atualização

Adicionar ao CI:

```bash
pnpm install --frozen-lockfile
pnpm audit --prod --audit-level high
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Regras:

- Renovate/Dependabot em grupos por ecossistema.
- Patches de segurança com SLA curto.
- Major sempre em PR isolado.
- Nunca atualizar lockfile sem testes/build.
- Não usar `latest` em Docker; fixar versão/digest.
- Revisar dependências não usadas trimestralmente.

## 5. Password hashing moderno

### Estado atual

Todos os fluxos usam bcrypt cost 6:

- cadastro;
- reset;
- troca de senha;
- seed.

Cost 6 é baixo. A política também é inconsistente: cadastro aceita qualquer string, enquanto reset/update exigem seis caracteres.

### Recomendação

Migrar para Argon2id. Uma opção operacionalmente simples em Node é `@node-rs/argon2`:

```bash
pnpm --filter @saas/api add @node-rs/argon2
```

Parâmetros iniciais a calibrar na VPS:

```text
algorithm: Argon2id
memoryCost: 64 MiB, se a capacidade permitir
timeCost: 2–3
parallelism: 1
tempo alvo: aproximadamente 100–250 ms
```

O valor final deve respeitar memória e concorrência da VPS. Rate limiting e fila/backpressure são obrigatórios para evitar DoS por hashing.

### Migração sem reset em massa

O hash codificado identifica o algoritmo:

```ts
if (passwordHash.startsWith('$argon2id$')) {
  return verifyArgon2(passwordHash, password)
}

if (passwordHash.startsWith('$2')) {
  const valid = await compareBcrypt(password, passwordHash)

  if (valid) {
    const upgraded = await hashArgon2(password)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: upgraded },
    })
  }

  return valid
}
```

Novos cadastros/reset/update usam Argon2id imediatamente. Bcrypt permanece apenas para verificação e rehash oportunista.

Política de senha:

- mínimo de 12–15 caracteres;
- máximo de pelo menos 128;
- permitir passphrases/Unicode;
- bloquear senhas comuns/vazadas;
- não exigir combinações artificiais de símbolo/maiúscula;
- normalizar política entre cadastro, reset e update.

## 6. Tokens seguros

### Bearer tokens de alta entropia

Para reset, refresh e convite de uso único:

```ts
const token = randomBytes(32).toString('base64url')
const digest = createHash('sha256').update(token).digest('base64url')
```

Enviar o token bruto uma vez e armazenar apenas digest.

### Códigos curtos

Códigos de seis dígitos possuem espaço pequeno e não devem usar SHA-256 simples. Usar:

```ts
const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
const digest = createHmac('sha256', env.TOKEN_PEPPER)
  .update(code)
  .digest('base64url')
```

Adicionar expiração, tentativas e consumo atômico.

## 7. JWT

Para um monólito, HS256 continua aceitável se:

- `@fastify/jwt`/`fast-jwt` estiverem atualizados;
- algoritmo estiver fixado explicitamente;
- segredo tiver pelo menos 32 bytes aleatórios;
- `issuer` e `audience` forem verificados;
- houver `kid`/key ring para rotação;
- access token for curto;
- sessão/refresh puder ser revogada.

Se múltiplos serviços precisarem verificar tokens, migrar para assinatura assimétrica, como EdDSA ou RS256, mantendo a chave privada somente no emissor.

Modelo recomendado:

```text
access token: 10–15 minutos
refresh token: 256 bits aleatórios, armazenado como digest
refresh rotation: a cada uso
reuse detection: revoga toda a família
sessionVersion/sid: invalidado em reset/troca/anonimização
```

Não colocar PII, role mutável ou membership completa no JWT. Resolver autorização atual no banco/cache controlado.

## 8. Criptografia de dados sensíveis em repouso

Campos prioritários:

- `medicalConditions`;
- futuros access/refresh tokens Strava reais;
- outros tokens OAuth de longa duração.

Usar criptografia autenticada por campo:

```text
AES-256-GCM
nonce aleatório de 96 bits por gravação
AAD: userId + nome do campo + versão
keyVersion persistida
chave mestre fora do PostgreSQL
```

Formato conceitual:

```ts
type EncryptedField = {
  version: 1
  keyVersion: string
  iv: string
  ciphertext: string
  tag: string
}
```

Migração online:

1. Adicionar coluna cifrada paralela.
2. Novas escritas usam ciphertext.
3. Leitura usa ciphertext com fallback temporário.
4. Backfill idempotente em lotes.
5. Verificar contagem e decrypt.
6. Remover plaintext em migração posterior.
7. Manter key ring para rotação/lazy re-encryption.

Não armazenar a chave de criptografia no mesmo banco. Usar secret manager/KMS/Vault ou, no mínimo, segredo separado com backup/runbook rigoroso.

Criptografia não substitui RBAC, DTO mínimo, auditoria e política LGPD.

## 9. OAuth

Implementar:

- `state` de 256 bits aleatórios;
- expiração de 5–10 minutos;
- consumo único;
- PKCE com SHA-256 quando suportado;
- `email_verified` obrigatório;
- vínculo por provider account ID;
- reautenticação para merge de conta;
- redirect interno allowlisted.

Não colocar token de convite ou PII no `state` enviado ao provedor.

## 10. Gate de conclusão

A modernização só está concluída quando:

- `pnpm audit --prod` não apresenta crítico/alto aplicável no runtime;
- CASL e JWT estão em versões corrigidas;
- Next/Fastify estão acima das versões patched dos advisories;
- Argon2id é usado em novos hashes;
- bcrypt legado é rehashado no login;
- tokens são armazenados como digest e expiram;
- JWT possui rotação/revogação;
- dados médicos/tokens reais estão cifrados;
- `pnpm lint`, typecheck, testes e build passam;
- Biome permanece a única ferramenta de lint/formatação.
