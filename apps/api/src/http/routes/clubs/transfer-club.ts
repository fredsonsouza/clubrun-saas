import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { clubSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function transferClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/owner',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Transfer club ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.uuid(),
          }),
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
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const authClub = clubSchema.parse(club)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('transfer_ownership', authClub)) {
          throw new UnauthorizedError(
            `You're not allowed to transfer this club ownership`
          )
        }

        const { transferToUserId } = request.body

        const transferToMembership = await prisma.member.findUnique({
          where: {
            clubId_userId: {
              clubId: club.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMembership) {
          throw new BadRequestError(`Target user is not a member of this club`)
        }

        await prisma.$transaction([
          prisma.member.update({
            where: {
              clubId_userId: {
                clubId: club.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'OWNER',
            },
          }),

          prisma.club.update({
            where: {
              id: club.id,
            },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ])

        return reply.status(204).send()
      }
    )
}
