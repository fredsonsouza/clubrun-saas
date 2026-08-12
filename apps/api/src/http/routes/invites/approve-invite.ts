import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function approveInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/invites/:inviteId/approve',
      {
        schema: {
          tags: ['invites'],
          summary: 'Approve a member indication',
          params: z.object({
            slug: z.string(),
            inviteId: z.uuid(),
          }),
        },
      },
      async (request, reply) => {
        const { slug, inviteId } = request.params
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'update', 'Invite')
        if (!['OWNER', 'MANAGER'].includes(context.memberShip.role)) {
          throw new ForbiddenError(
            'Only owners and managers can approve invites.'
          )
        }

        return reply.status(204).send()
      }
    )
}
