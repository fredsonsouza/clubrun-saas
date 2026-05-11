import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { createAuditLog } from '@/utils/audit-log'

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

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (cannot('delete', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to remove this member from club.`
          )
        }

        // Se o motivo for APENAS financeiro, podemos validar se realmente há boleto em atraso
        // mas para dar flexibilidade ao owner, vamos apenas registrar os motivos no log.

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
            description
          },
        })

        return reply.status(204).send()
      }
    )
}
