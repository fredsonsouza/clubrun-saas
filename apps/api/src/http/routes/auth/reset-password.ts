import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { hashPassword, passwordSchema } from '@/utils/identity'
import { consumeBearerTokenInTransaction, sha256 } from '@/utils/tokens'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/reset',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { code?: string }
        return sha256(body.code ?? '')
      }),
      schema: {
        tags: ['auth'],
        summary: 'Reset user password',
        body: z.object({ code: z.string().min(32), password: passwordSchema }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body
      const passwordHash = await hashPassword(password)

      const reset = await prisma.$transaction(async (tx) => {
        const consumed = await consumeBearerTokenInTransaction(
          tx,
          code,
          'PASSWORD_RECOVER'
        )
        if (!consumed) return false

        await tx.user.update({
          where: { id: consumed.userId },
          data: { passwordHash, sessionVersion: { increment: 1 } },
        })
        await tx.token.updateMany({
          where: { userId: consumed.userId, consumedAt: null },
          data: { consumedAt: new Date() },
        })
        return true
      })

      if (!reset) throw new UnauthorizedError('Invalid or expired reset token')
      return reply.status(204).send(null)
    }
  )
}
