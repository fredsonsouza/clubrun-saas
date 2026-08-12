import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function updateMemberStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/members/:memberId/status',
      {
        schema: {
          tags: ['members'],
          summary: 'Approve or reject a member request',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),
          body: z.object({
            status: z.enum(['ACTIVE', 'INACTIVE']),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const { status } = request.body
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )

        if (club.ownerId !== userId || cannot('update_roles', 'User')) {
          throw new ForbiddenError(
            `You're not allowed to update members status.`
          )
        }

        const memberToUpdate = await prisma.member.findUnique({
          where: {
            id: memberId,
            clubId: club.id,
          },
        })

        if (!memberToUpdate) {
          throw new BadRequestError('Member not found.')
        }

        if (status === 'INACTIVE') {
          await prisma.member.delete({
            where: { id: memberId, clubId: club.id },
          })
          return reply.status(204).send(null)
        }

        await prisma.member.update({
          where: { id: memberId, clubId: club.id },
          data: { status },
        })

        return reply.status(204).send(null)
      }
    )
}
