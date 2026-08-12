import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/utils/identity'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function anonymizeUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users/me/anonymize',
      {
        schema: {
          tags: ['users'],
          summary: 'Anonymize user account (GDPR deletion)',
          security: [{ bearerAuth: [] }],
          body: z.object({ password: z.string().max(128).optional() }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { passwordHash: true },
        })
        if (!user) throw new BadRequestError('User not found.')

        if (user.passwordHash) {
          if (!request.body.password) {
            throw new BadRequestError('Password confirmation is required.')
          }
          const verification = await verifyPassword(
            request.body.password,
            user.passwordHash
          )
          if (!verification.valid) {
            throw new BadRequestError('Invalid password.')
          }
        }

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: userId },
            data: {
              name: 'Atleta Excluído',
              email: `deleted-${userId}@clubrun.com`,
              username: null,
              passwordHash: null,
              avatarUrl: null,
              sessionVersion: { increment: 1 },
            },
          })
          await tx.athleteProfile.deleteMany({ where: { userId } })
          await tx.account.deleteMany({ where: { userId } })
          await tx.token.deleteMany({ where: { userId } })
          await tx.member.updateMany({
            where: { userId },
            data: { status: 'INACTIVE' },
          })
        })

        return reply.status(204).send(null)
      }
    )
}
