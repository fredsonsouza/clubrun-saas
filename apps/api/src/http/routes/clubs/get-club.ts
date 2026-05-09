import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'

export async function getClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug',
    {
      schema: {
        tags: ['clubs'],
        summary: 'Get details from club',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            club: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              domain: z.string().nullable(),
              shouldAttachUsersByDomain: z.boolean(),
              avatarUrl: z.string().nullable(),
              bannerUrl: z.string().nullable(),
              description: z.string().nullable(),
              cnpj: z.string().nullable(),
              city: z.string().nullable(),
              state: z.string().nullable(),
              status: z.enum(['ACTIVE', 'DEACTIVATED']),
              subscriptionStatus: z.string().nullable(),
              createdAt: z.date(),
              updatedAt: z.date(),
              ownerId: z.string(),
            }),
            membership: z.object({
              role: z.string(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { slug } = request.params
      const { club, memberShip } = await request.getUserMemberShip(slug)

      return {
        club,
        membership: {
          role: memberShip.role,
        },
      }
    }
  )
}
