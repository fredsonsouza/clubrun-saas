import { auth } from '@/http/middlewares/auth'
import { enqueueEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import {
  EMAIL_VERIFICATION_TTL_MS,
  issueOtpInTransaction,
  sha256,
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

        await prisma.$transaction(async (tx) => {
          const code = await issueOtpInTransaction(
            tx,
            userId,
            'EMAIL_VERIFICATION',
            EMAIL_VERIFICATION_TTL_MS
          )
          await enqueueEmail(tx, {
            userId,
            to: user.email,
            template: 'EMAIL_VERIFICATION',
            payload: { name: user.name ?? 'atleta', code },
            idempotencyKey: `verification:${userId}:${sha256(code)}`,
          })
        })

        return reply.status(204).send(null)
      }
    )
}
