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
      '/clubs/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a member',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),
          body: z.object({
            role: roleSchema,
            status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()

        const { memberShip } = await request.getUserMemberShip(slug)

        if (memberShip.role !== 'OWNER' && memberShip.role !== 'MANAGER') {
          throw new UnauthorizedError(
            `You're not allowed to update this member`
          )
        }
        // const { cannot } = getUserPermissions(userId, memberShip.role)

        // if (cannot('update', 'User')) {
        //   throw new UnauthorizedError(
        //     `You're not allowed to update this member`
        //   )
        // }

        const { role, status } = request.body

        await prisma.member.update({
          where: {
            id: memberId,
          },
          data: {
            ...(role && { role: role as any }),
            ...(status && { status }),
          },
        })

        return reply.status(204).send()
      }
    )
}
