import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getRaceResults(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/races/:raceId/results',
      {
        schema: {
          tags: ['races'],
          summary: 'Get all results for a race',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              results: z.array(
                z.object({
                  id: z.string().uuid(),
                  time: z.number().int(),
                  position: z.number().int().nullable(),
                  pace: z.number().nullable(),
                  athlete: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const { club } = await request.getUserMemberShip(slug)

        const results = await prisma.raceResult.findMany({
          where: {
            raceId,
            race: {
              clubId: club.id,
            },
          },
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { time: 'asc' }],
        })

        return reply.status(200).send({ results })
      }
    )
}
