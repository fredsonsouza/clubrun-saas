import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getRaces(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/races',
      {
        schema: {
          tags: ['races'],
          summary: 'Get club races',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              races: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  distance: z.number(),
                  city: z.string(),
                  date: z.date(),
                  imageUrl: z.string().url().nullable(),
                  isRegistered: z.boolean(),
                  _count: z.object({
                    results: z.number(),
                    participants: z.number(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)

        const races = await prisma.race.findMany({
          where: {
            clubId: club.id,
          },
          include: {
            participants: {
              where: {
                athleteId: userId,
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                results: true,
                participants: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        })

        const racesWithRegistration = races.map((race) => {
          const { participants, ...rest } = race
          return {
            ...rest,
            isRegistered: participants.length > 0,
          }
        })

        return reply.status(200).send({ races: racesWithRegistration })
      }
    )
}
