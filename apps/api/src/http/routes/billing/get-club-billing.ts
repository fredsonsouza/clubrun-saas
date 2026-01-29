import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function getClubBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/billing',
      {
        schema: {
          tags: ['billing'],
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
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('get', 'Billing')) {
          throw new UnauthorizedError(
            `You're not allowed to get billing details from this organization.`
          )
        }

        const [amountOfMembers] = await Promise.all([
          prisma.member.count({
            where: {
              clubId: club.id,
              role: { not: 'BILLING' },
            },
          }),
        ])

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
