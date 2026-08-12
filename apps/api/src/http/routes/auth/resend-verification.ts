import { auth } from '@/http/middlewares/auth'
import { resend } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import {
  EMAIL_VERIFICATION_TTL_MS,
  issueOtpInTransaction,
} from '@/utils/tokens'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function resendVerification(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/auth/resend-verification',
      {
        config: authRateLimit(
          (request) => request.headers.authorization ?? 'missing-authorization',
          3,
          '5 minutes'
        ),
        schema: {
          tags: ['auth'],
          summary: 'Resend verification code',
          security: [{ bearerAuth: [] }],
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId({ allowUnverified: true })
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, emailVerifiedAt: true },
        })
        if (!user) throw new UnauthorizedError('User not found.')
        if (user.emailVerifiedAt) return reply.status(204).send(null)

        const code = await prisma.$transaction((tx) =>
          issueOtpInTransaction(
            tx,
            userId,
            'EMAIL_VERIFICATION',
            EMAIL_VERIFICATION_TTL_MS
          )
        )

        try {
          await resend.emails.send({
            from: 'ClubRun <onboarding@resend.dev>',
            to: user.email,
            subject: 'Seu novo código de verificação',
            html: `
              <div style="font-family: sans-serif; line-height: 1.6;">
                <h2>Olá, ${user.name ?? 'atleta'}!</h2>
                <p>Seu novo código é:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</div>
                <p>Ele expira em 15 minutos.</p>
              </div>`,
          })
        } catch (error) {
          console.error('[MAIL-ERROR] Verification delivery failed', error)
        }

        return reply.status(204).send(null)
      }
    )
}
