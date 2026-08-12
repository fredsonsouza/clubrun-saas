import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { debitShoesOnce } from '@/services/shoes-mileage-ledger'
import {
  updateAthletePaceAverage,
  updateAthleteRanking,
} from '@/services/update-athlete-ranking'
import { createAuditLog } from '@/utils/audit-log'
import { createSlug } from '@/utils/create-slug'
import {
  completeIdempotentCommand,
  getIdempotencyKey,
  startIdempotentCommand,
} from '@/utils/idempotency'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function createWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/workouts',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Create a new workout',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string(),
            distance: z.number().finite().positive().max(500),
            duration: z.number().finite().positive().nullable().optional(),
            pace: z.number().finite().positive().optional(),
            athleteId: z.string().uuid().nullable().optional(),
            status: z.enum(['PLANNED', 'COMPLETED']).default('COMPLETED'),
            assignmentMode: z.enum(['GOAL', 'FREE']).nullable().optional(),
            type: z.enum([
              'EASY',
              'INTERVAL',
              'TEMPO',
              'LONG',
              'RECOVERY',
              'RACE',
              'STRENGTH',
              'WALK',
            ]),
            date: z.coerce.date(),
            notes: z.string().nullish(),
            routeData: z.json().optional(),
            visibility: z
              .enum(['PUBLIC', 'COACH_ONLY', 'PRIVATE'])
              .default('PUBLIC'),
          }),
          headers: z.object({
            'idempotency-key': z.string().min(8).max(255),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              workoutId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const context = await requireActiveMembership(request, slug)
        const { club, userId } = context

        if (club.status === 'DEACTIVATED') {
          throw new ForbiddenError(
            'This club is deactivated and does not allow new workouts.'
          )
        }

        const {
          title,
          distance,
          duration,
          date,
          type,
          notes,
          athleteId,
          status,
          assignmentMode,
          visibility,
        } = request.body

        // If target athlete is different from creator, check if can prescribe
        const targetAthleteId = athleteId || userId
        const isPrescribing = targetAthleteId !== userId

        requireClubAbility(context, isPrescribing ? 'prescribe' : 'create', {
          __typename: 'Workout',
          id: `${club.id}:new-workout`,
          clubId: club.id,
          athleteId: targetAthleteId,
          visibility,
        })

        if (isPrescribing) {
          const targetMembership = await prisma.member.findFirst({
            where: {
              clubId: club.id,
              userId: targetAthleteId,
              status: 'ACTIVE',
            },
            select: { id: true },
          })

          if (!targetMembership) {
            throw new ForbiddenError(
              'O atleta precisa ser membro ativo deste clube.'
            )
          }
        }

        const { routeData } = request.body

        // Business Rule: 2h Lead Time for Prescriptions on the same day
        if (isPrescribing) {
          const now = new Date()
          const workoutDate = new Date(date)

          const isSameDay =
            now.getFullYear() === workoutDate.getFullYear() &&
            now.getMonth() === workoutDate.getMonth() &&
            now.getDate() === workoutDate.getDate()

          if (isSameDay) {
            const twoHoursInMs = 2 * 60 * 60 * 1000
            if (workoutDate.getTime() - now.getTime() < twoHoursInMs) {
              throw new BadRequestError(
                'Para manter a organização, treinos para o mesmo dia devem ser prescritos com no mínimo 2h de antecedência.'
              )
            }
          }
        }

        const resolvedStatus = isPrescribing ? 'PLANNED' : status

        const derivedPace =
          resolvedStatus === 'COMPLETED' && duration
            ? duration / 60 / distance
            : null

        let shoesUsed: string | null = null

        if (resolvedStatus === 'COMPLETED') {
          const athleteProfile = await prisma.athleteProfile.findUnique({
            where: { userId: targetAthleteId },
            select: {
              shoes: true,
              shoesRemainingDistance: true,
            },
          })

          if (athleteProfile?.shoes) {
            shoesUsed = athleteProfile.shoes
            if (
              athleteProfile.shoesRemainingDistance !== null &&
              athleteProfile.shoesRemainingDistance !== undefined
            ) {
              if (athleteProfile.shoesRemainingDistance < distance) {
                throw new BadRequestError(
                  `O treino excede a vida útil restante do seu tênis (${athleteProfile.shoesRemainingDistance.toFixed(1)} km). Por favor, realize a troca do calçado.`
                )
              }
            }
          }
        }

        const idempotencyKey = getIdempotencyKey(
          request.headers['idempotency-key']
        )
        const workout = await prisma.$transaction(async (tx) => {
          const command = await startIdempotentCommand(tx, {
            principalKey: userId,
            scope: `club:${club.id}:workout:create`,
            key: idempotencyKey,
            payload: request.body,
          })
          if (command?.replayResourceId) {
            const replay = await tx.workout.findFirst({
              where: { id: command.replayResourceId, clubId: club.id },
            })
            if (replay) return replay
          }

          const createdWorkout = await tx.workout.create({
            data: {
              title,
              distance,
              duration,
              date,
              pace: derivedPace,
              type,
              notes,
              routeData: routeData ?? undefined,
              originalDate: isPrescribing ? date : null,
              status: resolvedStatus,
              assignmentMode: isPrescribing ? assignmentMode || 'FREE' : null,
              targetDistance: resolvedStatus === 'PLANNED' ? distance : null,
              targetDuration: resolvedStatus === 'PLANNED' ? duration : null,
              slug: `${createSlug(title)}-${Date.now()}`,
              clubId: club.id,
              athleteId: targetAthleteId,
              visibility,
              shoesUsed,
            },
          })

          if (resolvedStatus === 'COMPLETED') {
            if (shoesUsed) {
              try {
                await debitShoesOnce(tx, {
                  athleteId: targetAthleteId,
                  sourceType: 'WORKOUT',
                  sourceId: createdWorkout.id,
                  distanceKm: distance,
                })
              } catch {
                throw new BadRequestError(
                  'Quilometragem de tênis insuficiente.'
                )
              }
            }
            await updateAthleteRanking(tx, targetAthleteId, club.id, date)
            await updateAthletePaceAverage(tx, targetAthleteId, club.id)
          }

          if (idempotencyKey) {
            await completeIdempotentCommand(tx, {
              principalKey: userId,
              scope: `club:${club.id}:workout:create`,
              key: idempotencyKey,
              resourceId: createdWorkout.id,
            })
          }
          return createdWorkout
        })

        await createAuditLog({
          action: 'WORKOUT_CREATED',
          entity: 'WORKOUT',
          entityId: workout.id,
          userId,
          payload: {
            clubId: club.id,
            distance: workout.distance,
            athleteId: targetAthleteId,
          },
        })

        return reply.status(201).send({
          workoutId: workout.id,
        })
      }
    )
}
