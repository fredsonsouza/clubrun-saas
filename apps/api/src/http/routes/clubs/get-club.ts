import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

export async function getClub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
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
              id: z.uuid(),
              name: z.string(),
              slug: z.string(),
              domain: z.string().nullable(),
              shouldAttachUsersByDomain: z.boolean(),
              avatarUrl: z.url().nullable(),
              createdAt: z.date(),
              updatedAt: z.date(),
              ownerId: z.uuid(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { slug } = request.params
      const { club } = await request.getUserMemberShip(slug)

      return {
        club,
      }
    }
  )
}
