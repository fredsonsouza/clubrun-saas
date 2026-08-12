import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function createRace(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/races',
      {
        schema: {
          tags: ['races'],
          summary: 'Create a new race',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            distance: z.number(),
            city: z.string(),
            date: z.coerce.date(),
            imageUrl: z.string().url().nullish(),
            routeData: z.json().nullish(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              raceId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const context = await requireActiveMembership(request, slug)
        const { club } = context

        if (club.status === 'DEACTIVATED') {
          throw new ForbiddenError(
            `This club is deactivated and does not allow new races.`
          )
        }

        requireClubAbility(context, 'create', 'Race')

        const { name, distance, city, date, imageUrl, routeData } = request.body

        const race = await prisma.race.create({
          data: {
            name,
            distance,
            city,
            date,
            imageUrl,
            routeData: routeData ?? undefined,
            clubId: club.id,
          },
        })

        return reply.status(201).send({
          raceId: race.id,
        })
      }
    )
}
