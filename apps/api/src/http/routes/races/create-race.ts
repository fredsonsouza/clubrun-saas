import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import {
  completeIdempotentCommand,
  getIdempotencyKey,
  startIdempotentCommand,
} from '@/utils/idempotency'
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
            distance: z.number().finite().positive().max(500),
            city: z.string(),
            date: z.coerce.date(),
            imageUrl: z.string().url().nullish(),
            routeData: z.json().nullish(),
          }),
          headers: z.object({
            'idempotency-key': z.string().min(8).max(255),
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
            'This club is deactivated and does not allow new races.'
          )
        }

        requireClubAbility(context, 'create', 'Race')

        const { name, distance, city, date, imageUrl, routeData } = request.body

        const idempotencyKey = getIdempotencyKey(
          request.headers['idempotency-key']
        )
        const race = await prisma.$transaction(async (tx) => {
          const command = await startIdempotentCommand(tx, {
            principalKey: context.userId,
            scope: `club:${club.id}:race:create`,
            key: idempotencyKey,
            payload: request.body,
          })
          if (command?.replayResourceId) {
            const replay = await tx.race.findFirst({
              where: { id: command.replayResourceId, clubId: club.id },
            })
            if (replay) return replay
          }

          const createdRace = await tx.race.create({
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
          if (idempotencyKey) {
            await completeIdempotentCommand(tx, {
              principalKey: context.userId,
              scope: `club:${club.id}:race:create`,
              key: idempotencyKey,
              resourceId: createdRace.id,
            })
          }
          return createdRace
        })

        return reply.status(201).send({
          raceId: race.id,
        })
      }
    )
}
