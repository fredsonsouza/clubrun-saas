import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getRace(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/races/:raceId',
      {
        schema: {
          tags: ['races'],
          summary: 'Get race details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              race: z.object({
                id: z.string().uuid(),
                name: z.string(),
                distance: z.number(),
                city: z.string(),
                date: z.date(),
                imageUrl: z.string().url().nullable(),
                routeData: z.any().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const { club } = await request.getUserMemberShip(slug)

        const race = await prisma.race.findFirst({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new BadRequestError('Race not found.')
        }

        return reply.status(200).send({ race })
      }
    )
}
