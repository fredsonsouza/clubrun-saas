import { getUserPermissions } from '@/utils/get-user-permissions'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { roleSchema } from '@saas/auth'
import { auth } from '@/http/middlewares/auth'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/members/memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a memebber',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),
          body: z.object({
            role: roleSchema,
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('update', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to update this member`
          )
        }

        const { role } = request.body

        await prisma.member.update({
          where: {
            id: memberId,
            clubId: club.id,
          },
          data: {
            role,
          },
        })

        return reply.status(204).send()
      }
    )
}
