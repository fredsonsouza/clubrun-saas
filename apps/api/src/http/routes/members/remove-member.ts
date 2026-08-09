import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/clubs/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Remove a member from the club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),

          body: z.object({
            reasons: z.array(z.string()),
            description: z.string().max(250).optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const { reasons, description } = request.body
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId,
          club.ownerId
        )

        if (cannot('delete', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to remove this member from club.`
          )
        }

        const targetMember = await prisma.member.findUnique({
          where: { id: memberId, clubId: club.id },
          select: { userId: true },
        })

        if (!targetMember) {
          throw new BadRequestError('Member not found.')
        }

        if (targetMember.userId === club.ownerId) {
          throw new UnauthorizedError(
            'The club owner can only leave through the transfer flow.'
          )
        }

        await prisma.member.delete({
          where: {
            id: memberId,
            clubId: club.id,
          },
        })

        await createAuditLog({
          action: 'ATHLETE_REMOVED',
          entity: 'ATHLETE',
          entityId: memberId,
          userId,
          payload: {
            clubId: club.id,
            slug: club.slug,
            reasons,
            description,
          },
        })

        return reply.status(204).send(null)
      }
    )
}
