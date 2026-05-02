import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { getUserPermissions } from '@/utils/get-user-permissions'

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

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('update_roles', 'User')) {
          throw new UnauthorizedError(`You're not allowed to update members status.`)
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
            where: { id: memberId },
          })
          return reply.status(204).send()
        }

        await prisma.member.update({
          where: { id: memberId },
          data: { status },
        })

        return reply.status(204).send()
      }
    )
}
