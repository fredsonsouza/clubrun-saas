import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { updateAthleteRanking } from '@/services/update-athlete-ranking'
import { createAuditLog } from '@/utils/audit-log'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

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
            distance: z.number(),
            duration: z.number().nullable().optional(),
            pace: z.number().optional(),
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
            routeData: z.any().optional(),
            visibility: z
              .enum(['PUBLIC', 'COACH_ONLY', 'PRIVATE'])
              .default('PUBLIC'),
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
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (club.status === 'DEACTIVATED') {
          throw new UnauthorizedError(
            'This club is deactivated and does not allow new workouts.'
          )
        }

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId,
          club.ownerId
        )

        const {
          title,
          distance,
          duration,
          date,
          pace,
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

        if (isPrescribing && cannot('prescribe', 'Workout')) {
          throw new UnauthorizedError(
            `You're not allowed to prescribe workouts to other athletes`
          )
        }

        if (!isPrescribing && cannot('create', 'Workout')) {
          throw new UnauthorizedError(
            `You're not allowed to create new workouts`
          )
        }

        const { routeData } = request.body

        console.log(
          '[DEBUG] API create-workout routeData:',
          routeData ? 'PRESENTE' : 'AUSENTE',
          JSON.stringify(routeData)
        )

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

        const workout = await prisma.workout.create({
          data: {
            title,
            distance,
            duration,
            date,
            pace,
            type,
            notes,
            routeData,
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

        // Update AthleteProfile and Ranking ONLY if workout is COMPLETED
        if (workout.status === 'COMPLETED') {
          await updateAthleteRanking(targetAthleteId, club.id, date)

          if (shoesUsed) {
            await prisma.athleteProfile.update({
              where: { userId: targetAthleteId },
              data: {
                shoesRemainingDistance: {
                  decrement: distance,
                },
              },
            })
          }

          const athleteStats = await prisma.workout.aggregate({
            where: {
              athleteId: targetAthleteId,
              clubId: club.id,
              status: 'COMPLETED',
            },
            _sum: {
              distance: true,
              duration: true,
            },
          })

          if (athleteStats._sum.distance && athleteStats._sum.duration) {
            const totalDistance = athleteStats._sum.distance
            const totalSeconds = athleteStats._sum.duration
            const newPaceAvg = totalSeconds / 60 / totalDistance

            await prisma.athleteProfile.upsert({
              where: { userId: targetAthleteId },
              create: {
                userId: targetAthleteId,
                paceAvg: newPaceAvg,
              },
              update: {
                paceAvg: newPaceAvg,
              },
            })
          }
        }

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
