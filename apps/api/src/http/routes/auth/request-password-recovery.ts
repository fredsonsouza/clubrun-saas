import { enqueueEmail } from '@/lib/email'

import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { normalizeEmail } from '@/utils/identity'
import {
  PASSWORD_RECOVERY_TTL_MS,
  issueBearerTokenInTransaction,
  sha256,
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

      await prisma.$transaction(async (tx) => {
        const token = await issueBearerTokenInTransaction(
          tx,
          user.id,
          'PASSWORD_RECOVER',
          PASSWORD_RECOVERY_TTL_MS
        )
        await enqueueEmail(tx, {
          userId: user.id,
          to: email,
          template: 'PASSWORD_RECOVERY',
          payload: {
            resetUrl: `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?code=${token}`,
          },
          idempotencyKey: `password-recovery:${user.id}:${sha256(token)}`,
        })
      })

      return reply.status(201).send(null)
    }
  )
}
