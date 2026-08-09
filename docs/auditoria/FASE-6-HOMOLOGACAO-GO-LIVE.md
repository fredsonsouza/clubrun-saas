# Fase 6 — Homologação, Segurança e Go-live

## Objetivo

Demonstrar, com evidências, que as correções funcionam em conjunto e que a aplicação pode receber usuários reais.

## 6.1 Ambiente de homologação

Deve ser equivalente à produção em:

- versão Node/PostgreSQL;
- reverse proxy e TLS;
- variáveis de ambiente, sem reutilizar segredos;
- migration path;
- object storage;
- workers/outbox;
- limites de pool e rate limit.

Usar dados sintéticos ou anonimizados.

## 6.2 Matriz de testes de segurança

### Autenticação

- [ ] Cadastro não concede membership antes da verificação.
- [ ] E-mail não verificado não acessa recursos privados.
- [ ] OAuth rejeita state inválido, expirado e reutilizado.
- [ ] OAuth não faz merge silencioso de conta local.
- [ ] Redirect externo é rejeitado.
- [ ] Cookie não é acessível por JavaScript.
- [ ] Reset revoga sessões.
- [ ] Token expirado/consumido/tipo incorreto falha.

### Autorização e tenant

Para cada rota protegida, testar:

1. sem token;
2. token inválido;
3. papel insuficiente;
4. membership pendente;
5. membership inativa;
6. recurso de outro tenant;
7. recurso inexistente;
8. system admin conforme política.

Casos obrigatórios:

- [ ] Membro cross-tenant.
- [ ] Invoice cross-tenant.
- [ ] Corrida/participante cross-tenant.
- [ ] Treino/reação/ranking cross-tenant.
- [ ] Convite de papel superior.
- [ ] Remoção/inativação de owner.

### Privacidade

- [ ] Perfil privado não entrega payload oculto no RSC.
- [ ] `PRIVATE` e `COACH_ONLY` funcionam no filtro da API.
- [ ] Dados médicos não aparecem em listagens.
- [ ] GeoJSON não aparece em logs.
- [ ] Tokens e password hash nunca entram em DTOs.
- [ ] Exclusão/anonimização trata storage, membership e propriedade.

## 6.3 Testes de consistência e concorrência

- [ ] Dupla conclusão de treino é idempotente/atômica.
- [ ] Dupla exclusão não duplica devolução de tênis.
- [ ] Duplo resultado de corrida não duplica efeitos.
- [ ] Ranking mensal/anual não duplica.
- [ ] Alteração de data recompõe períodos antigo/novo.
- [ ] Falha simulada intermediária faz rollback completo.
- [ ] Transferência concorrente preserva um único owner.

### Idempotência e retry

- [ ] Simular mutação aplicada com resposta perdida e reenviar a mesma key.
- [ ] Retry de criação retorna o mesmo treino/corrida.
- [ ] Mesma key com payload diferente retorna 409.
- [ ] Dois requests simultâneos alteram tênis exatamente uma vez.
- [ ] Retry de inscrição/reação mantém o estado desejado.
- [ ] Invoice/shutdown geram um único audit de transição.
- [ ] Webhook duplicado retorna 2xx sem duplicar efeito.
- [ ] Outbox possui unique de evento e suporta retry do worker.
- [ ] Política de retry do `ky` está explícita por tipo de operação.

### React e Next.js

- [ ] Abrir/fechar todos os modais sem erro de hooks.
- [ ] Navegação lenta exibe loading por segmento.
- [ ] Erro de API ativa `error.tsx` e permite `reset()`.
- [ ] Recurso inexistente retorna 404/not-found, não 500/redirect genérico.
- [ ] Resposta assíncrona antiga não sobrescreve corrida, cidade, log ou página atual.
- [ ] Nenhum timer executa mutação após unmount.
- [ ] Teste de teclado cobre modais, menus e cards com ações.
- [ ] Formulários passam auditoria de labels/autocomplete/foco/erros.
- [ ] Área autenticada possui `noindex` e páginas públicas têm metadata adequada.
- [ ] Bundle antes/depois é registrado para perfil, dashboard, relatórios e corridas.
- [ ] LCP de banner/capa é medido com imagem otimizada.

## 6.4 Performance

Definir metas realistas antes do teste. Exemplo inicial, a ajustar conforme a VPS:

| Rota | Meta inicial |
|---|---|
| Login | P95 < 500 ms, considerando hash de senha calibrado |
| Feed de treinos | P95 < 300 ms para página normal |
| Ranking | P95 < 500 ms |
| Lista de membros | P95 < 300 ms |
| Upload | Limitado por tamanho/rede, sem bloquear event loop |

Checklist:

- [ ] Capturar `pg_stat_statements` durante carga.
- [ ] Conferir planos das cinco consultas mais caras.
- [ ] Validar uso dos índices adicionados.
- [ ] Verificar ausência de N+1.
- [ ] Monitorar pool waiting e conexões máximas.
- [ ] Confirmar que nenhum sort relevante cai em disco sob carga normal.
- [ ] Medir memória da API e web.

## 6.5 Teste de recuperação

- [ ] Restaurar backup completo em ambiente isolado.
- [ ] Medir RTO e RPO reais.
- [ ] Restaurar banco e objetos de storage coerentemente.
- [ ] Validar migration a partir do backup restaurado.
- [ ] Simular rollback/fix-forward de deploy.
- [ ] Confirmar que segredo rotacionado invalida acesso anterior.

## 6.6 Checklist operacional da VPS

- [ ] TLS válido e renovação automática.
- [ ] Firewall restringe PostgreSQL; porta não exposta publicamente.
- [ ] Usuário de processo sem privilégios excessivos.
- [ ] Disco, inode, CPU, memória e load monitorados.
- [ ] Alertas de 5xx e indisponibilidade.
- [ ] Logs com rotação/retenção.
- [ ] Backups automáticos e restore testado.
- [ ] Pool e `max_connections` documentados.
- [ ] Swagger protegido/desabilitado.
- [ ] Secrets fora do Git e com permissões adequadas.
- [ ] Endpoints simulados desabilitados.

## 6.7 Gate final de go-live

A aplicação só deve ser aberta quando:

- [ ] Fases 0 e 1 integralmente concluídas.
- [ ] Migrações ensaiadas e dados atuais verificados.
- [ ] Testes cross-tenant e RBAC passando.
- [ ] Upload seguro e storage durável.
- [ ] Lint, typecheck, testes e build passando no CI.
- [ ] Backup/restore validado.
- [ ] Performance medida, sem gargalo crítico conhecido.
- [ ] Política de privacidade cobre saúde e localização.
- [ ] Plano de incidente e contato operacional definidos.
- [ ] Pentest autenticado ou revisão independente final concluída.

## Evidências a preservar

- Relatório de testes.
- Planos `EXPLAIN` antes/depois.
- Lista de índices e tamanhos.
- Resultado de restore.
- Matriz RBAC aprovada.
- Checklist de secrets/rotação.
- Versionamento da migration aplicada.
- Data e responsável pelo aceite de go-live.
