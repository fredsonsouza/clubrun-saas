import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, passwordSchema, verifyPassword } from '@/utils/identity'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function updatePassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/users/me/password',
      {
        schema: {
          tags: ['users'],
          summary: 'Update user password',
          security: [{ bearerAuth: [] }],
          body: z.object({
            currentPassword: z.string().max(128),
            newPassword: passwordSchema,
          }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { currentPassword, newPassword } = request.body
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { passwordHash: true },
        })
        if (!user?.passwordHash) {
          throw new BadRequestError(
            'User not found or does not have a password set.'
          )
        }

        const verification = await verifyPassword(
          currentPassword,
          user.passwordHash
        )
        if (!verification.valid) {
          throw new BadRequestError('A senha atual está incorreta.')
        }

        const passwordHash = await hashPassword(newPassword)
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: userId },
            data: { passwordHash, sessionVersion: { increment: 1 } },
          })
          await tx.token.updateMany({
            where: { userId, consumedAt: null },
            data: { consumedAt: new Date() },
          })
        })

        return reply.status(204).send(null)
      }
    )
}
