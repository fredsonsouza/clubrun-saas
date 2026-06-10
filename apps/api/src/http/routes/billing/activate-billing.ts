import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'

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
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        // Only owner can activate billing
        if (cannot('manage', 'Billing')) {
          throw new UnauthorizedError(
            `You don't have permission to manage billing`
          )
        }

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

        return reply.status(204).send()
      }
    )
}
