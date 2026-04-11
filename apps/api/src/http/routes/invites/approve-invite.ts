import { auth } from '@/http/middlewares/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function approveInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slugs/invites/:inviteId/approve',
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
        const { memberShip } = await request.getUserMemberShip(slug)

        if (memberShip.role !== 'OWNER' && memberShip.role !== 'MANAGER') {
          return new UnauthorizedError('Unauthorized')
        }

        return reply.send(204)
      }
    )
}
