import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { clubSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { auth } from '@/http/middlewares/auth'

export async function shutdownClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/clubs/:slug',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Shutdown club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)

        const authClub = clubSchema.parse(club)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('delete', authClub)) {
          throw new UnauthorizedError(
            `You're not allowed to shutdown this club`
          )
        }

        await prisma.club.delete({
          where: {
            id: club.id,
          },
        })

        return reply.status(204).send()
      }
    )
}
