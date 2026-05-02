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

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (cannot('update_roles', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to update roles in this club.`
          )
        }

        const { role, status } = request.body

        // If promoting to a unique role, demote existing one
        if (role && ['MANAGER', 'COACH', 'BILLING'].includes(role)) {
          await prisma.member.updateMany({
            where: {
              clubId: memberShip.clubId,
              role,
              id: { not: memberId }
            },
            data: {
              role: 'ATHLETE'
            }
          })
        }

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
