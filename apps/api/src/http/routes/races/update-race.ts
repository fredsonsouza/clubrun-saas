import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateRace(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/races/:raceId',
      {
        schema: {
          tags: ['races'],
          summary: 'Update race details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().optional(),
            distance: z.number().optional(),
            city: z.string().optional(),
            date: z.string().datetime().optional(),
            imageUrl: z.string().url().nullable().optional(),
            routeData: z.any().nullish(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const { memberShip, club } = await request.getUserMemberShip(slug)

        if (memberShip.role !== 'OWNER' && memberShip.role !== 'MANAGER') {
          throw new UnauthorizedError(
            'Only owners and managers can update races.'
          )
        }

        const race = await prisma.race.findUnique({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new BadRequestError('Race not found')
        }

        const { name, distance, city, date, imageUrl, routeData } = request.body

        await prisma.race.update({
          where: {
            id: raceId,
          },
          data: {
            name,
            distance,
            city,
            date: date ? new Date(date) : undefined,
            imageUrl,
            routeData,
          },
        })

        return reply.status(204).send(null)
      }
    )
}
