import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getClubBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/billing',
      {
        schema: {
          tags: ['billings'],
          summary: 'Get billing information from club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              billing: z.object({
                seats: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                total: z.number(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'get', 'Billing')
        const { club } = context

        const amountOfMembers = await prisma.member.count({
          where: {
            clubId: club.id,
            role: { not: 'BILLING' },
          },
        })

        return {
          billing: {
            seats: {
              amount: amountOfMembers,
              unit: 10,
              price: amountOfMembers * 10,
            },
            total: amountOfMembers * 10,
          },
        }
      }
    )
}
