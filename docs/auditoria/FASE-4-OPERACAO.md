# Fase 4 — Operação de storage, e-mail e pagamentos

## Storage de imagens

O endpoint `/uploads` aceita somente imagens decodificáveis e reencoda o conteúdo para WebP. A chave é gerada no servidor e não aceita path ou extensão fornecida pelo cliente.

Em produção, `IMAGE_STORAGE_PROVIDER` deve apontar para um adapter de object storage implementado (por exemplo, S3-compatible). O adapter local é permitido apenas em desenvolvimento/teste; a API não registra storage local nem serve `/uploads` em produção até que um provider real seja conectado.

Requisitos do adapter de produção:

- bucket separado por ambiente;
- CORS restrito ao frontend oficial;
- lifecycle para temporários e órfãos;
- `put` idempotente por `uploadId`/key estável;
- `delete` acionável por anonimização/exclusão;
- URL pública somente para mídia aprovada ou URL assinada;
- métricas de bytes, falhas, latência e objetos órfãos.

## E-mail

Tokens e mensagens são persistidos na tabela `email_outbox` dentro da mesma transação do domínio. O provider é acessado apenas por `EmailProvider`.

O consumidor deve chamar `processPendingEmail` em um worker separado, com:

- múltiplos processos seguros por claim condicional;
- retry exponencial limitado;
- `idempotencyKey` única;
- dead-letter operacional após a política de tentativas;
- alerta para itens `FAILED` e idade do item mais antigo;
- logs apenas com ID do outbox, template, status e contagem de tentativa.

O payload pode conter código/link necessário para entrega, mas nunca deve ser impresso em logs. O template escapa valores controlados pelo usuário.

## Pagamentos

As rotas atuais de billing continuam simuladas e não concedem entitlement com base em retorno do navegador. Nenhum provider real ou webhook foi inventado sem credenciais/contrato.

Antes de habilitar pagamento:

- implementar adapter de checkout com idempotency key enviada ao PSP;
- validar assinatura do webhook com raw body;
- criar unique `(provider, eventId)`;
- validar moeda, valor, customer e invoice local;
- aplicar transição de invoice em transação;
- reconciliar periodicamente divergências;
- manter segredos exclusivamente no servidor.
