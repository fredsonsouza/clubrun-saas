import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { compare, hash } from 'bcryptjs'

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
            currentPassword: z.string(),
            newPassword: z.string().min(6),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { currentPassword, newPassword } = request.body

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user || !user.passwordHash) {
          throw new BadRequestError('User not found or does not have a password set.')
        }

        const isPasswordValid = await compare(currentPassword, user.passwordHash)

        if (!isPasswordValid) {
          throw new BadRequestError('A senha atual está incorreta.')
        }

        const passwordHash = await hash(newPassword, 6)

        await prisma.user.update({
          where: { id: userId },
          data: {
            passwordHash,
          },
        })

        return reply.status(204).send()
      }
    )
}
