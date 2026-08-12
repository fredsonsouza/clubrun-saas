import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'

import { assertSimulatedFlowAllowed } from '@/utils/simulated-flow-policy'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'


export async function activateBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/billing/activate',
      {
        schema: {
          tags: ['billings'],
          summary: 'Simulate billing activation (Pro Plan)',
          security: [{ bearerAuth: [] }],
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
        assertSimulatedFlowAllowed()
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'update', 'Billing')
        const { club, userId } = context

        await prisma.club.update({
          where: { id: club.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            stripeCustomerId: `cus_simulated_${Date.now()}`,
            stripeSubscriptionId: `sub_simulated_${Date.now()}`,
          },
        })

        createAuditLog({
          action: 'BILLING_ACTIVATED',
          entity: 'CLUB',
          entityId: club.id,
          userId,
          payload: { slug, subscriptionStatus: 'ACTIVE' },
        })

        return reply.status(204).send(null)
      }
    )
}
