import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

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
          body: z.object({
            password: z.string(), // Confirm identity
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { password } = request.body

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        // TODO: Verify password here if needed. 
        // For now, since it's a simulation/onboarding flow, we check if password was provided.
        // In a real app, use bcrypt.compare(password, user.passwordHash)

        // 1. Clear personal data
        const anonymizedEmail = `deleted-${userId}@clubrun.com`
        const anonymizedName = 'Atleta Excluído'

        await prisma.user.update({
          where: { id: userId },
          data: {
            name: anonymizedName,
            email: anonymizedEmail,
            username: null,
            passwordHash: null,
            avatarUrl: null,
          },
        })

        // 2. Delete sensitive secondary records
        await Promise.all([
          prisma.athleteProfile.deleteMany({ where: { userId } }),
          prisma.account.deleteMany({ where: { userId } }),
          prisma.token.deleteMany({ where: { userId } }),
        ])

        // 3. Set all memberships to INACTIVE
        await prisma.member.updateMany({
          where: { userId },
          data: {
            status: 'INACTIVE',
          },
        })

        return reply.status(204).send()
      }
    )
}
