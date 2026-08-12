import { resend } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { normalizeEmail } from '@/utils/identity'
import {
  issueBearerTokenInTransaction,
  PASSWORD_RECOVERY_TTL_MS,
} from '@/utils/tokens'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function requestPasswordRecovery(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recovery',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { email?: string }
        return normalizeEmail(body.email ?? '')
      }),
      schema: {
        tags: ['auth'],
        summary: 'Request password recovery',
        body: z.object({
          email: z.string().transform(normalizeEmail).pipe(z.email()),
        }),
        response: { 201: z.null() },
      },
    },
    async (request, reply) => {
      const email = normalizeEmail(request.body.email)
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (!user) return reply.status(201).send(null)

      const token = await prisma.$transaction((tx) =>
        issueBearerTokenInTransaction(
          tx,
          user.id,
          'PASSWORD_RECOVER',
          PASSWORD_RECOVERY_TTL_MS
        )
      )

      try {
        await resend.emails.send({
          from: 'ClubRun <onboarding@resend.dev>',
          to: email,
          subject: 'Recuperação de Senha - ClubRun',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
              <h2>Recuperação de Senha</h2>
              <p>Use o link abaixo para redefinir sua senha. Ele expira em 30 minutos.</p>
              <a href="${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?code=${token}">REDEFINIR SENHA</a>
              <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
            </div>`,
        })
      } catch (error) {
        console.error('[MAIL-ERROR] Password recovery delivery failed', error)
      }

      return reply.status(201).send(null)
    }
  )
}
