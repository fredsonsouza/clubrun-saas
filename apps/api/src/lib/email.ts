import { resend } from '@/lib/mail'

interface EmailOutboxDelegate {
  upsert(args: unknown): Promise<{ id: string }>
  findFirst(args: unknown): Promise<any>
  updateMany(args: unknown): Promise<{ count: number }>
  update(args: unknown): Promise<unknown>
}

type EmailDb = { emailOutbox: EmailOutboxDelegate }

type EmailTemplate = 'EMAIL_VERIFICATION' | 'PASSWORD_RECOVERY'

export interface EmailMessage {
  to: string
  subject: string
  html: string
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>
}

export const resendEmailProvider: EmailProvider = {
  async send(message) {
    const result = await resend.emails.send({
      from: 'ClubRun <onboarding@resend.dev>',
      to: message.to,
      subject: message.subject,
      html: message.html,
    })

    if (result.error) {
      throw new Error('Email provider rejected the message')
    }
  },
}

export async function enqueueEmail(
  db: EmailDb,
  input: {
    userId?: string
    to: string
    template: EmailTemplate
    payload: Record<string, string>
    idempotencyKey: string
  }
) {
  return db.emailOutbox.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    create: {
      userId: input.userId,
      toAddress: input.to,
      template: input.template,
      payload: input.payload,
      idempotencyKey: input.idempotencyKey,
    },
    update: {},
    select: { id: true },
  })
}

function renderEmail(template: string, payload: Record<string, unknown>) {
  if (template === 'EMAIL_VERIFICATION') {
    const name = typeof payload.name === 'string' ? payload.name : 'atleta'
    const code = typeof payload.code === 'string' ? payload.code : ''
    return {
      subject: 'Verifique seu e-mail no ClubRun',
      html: `<div style="font-family:sans-serif;line-height:1.6"><h2>Olá, ${escapeHtml(name)}!</h2><p>Use o código abaixo para verificar seu e-mail:</p><strong style="font-size:32px;letter-spacing:5px">${escapeHtml(code)}</strong><p>O código expira em 15 minutos.</p></div>`,
    }
  }

  const resetUrl = typeof payload.resetUrl === 'string' ? payload.resetUrl : ''
  return {
    subject: 'Recuperação de senha - ClubRun',
    html: `<div style="font-family:sans-serif;line-height:1.6"><h2>Recuperação de senha</h2><p>Use o link abaixo para redefinir sua senha:</p><a href="${escapeHtml(resetUrl)}">REDEFINIR SENHA</a><p>O link expira em 30 minutos.</p></div>`,
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        character
      ] ?? character
  )
}

export async function processPendingEmail(
  db: EmailDb,
  provider: EmailProvider = resendEmailProvider,
  now = new Date()
) {
  const candidate = await db.emailOutbox.findFirst({
    where: {
      status: { in: ['PENDING', 'FAILED'] },
      nextAttemptAt: { lte: now },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (!candidate) return false

  const claimed = await db.emailOutbox.updateMany({
    where: {
      id: candidate.id,
      status: candidate.status,
      nextAttemptAt: { lte: now },
    },
    data: { status: 'PROCESSING', attempts: { increment: 1 } },
  })

  if (claimed.count !== 1) return false

  try {
    const message = renderEmail(
      candidate.template,
      candidate.payload as Record<string, unknown>
    )
    await provider.send({ to: candidate.toAddress, ...message })
    await db.emailOutbox.update({
      where: { id: candidate.id },
      data: { status: 'SENT', sentAt: new Date(), lastError: null },
    })
    return true
  } catch {
    const retryAt = new Date(
      now.getTime() + Math.min(60 * 60_000, 2 ** candidate.attempts * 60_000)
    )
    await db.emailOutbox.update({
      where: { id: candidate.id },
      data: {
        status: 'FAILED',
        nextAttemptAt: retryAt,
        lastError: 'Email provider delivery failed',
      },
    })
    return false
  }
}
