import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getWorkouts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/workouts',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Get club workouts',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            page: z.coerce.number().min(1).default(1),
            limit: z.coerce.number().min(1).max(100).default(20),
            status: z.enum(['PLANNED', 'COMPLETED']).default('COMPLETED'),
            athleteId: z.string().uuid().optional(),
          }),
          response: {
            200: z.object({
              workouts: z.array(
                z.object({
                  id: z.uuid(),
                  title: z.string().nullable(),
                  slug: z.string().nullable(),
                  distance: z.number(),
                  duration: z.number().nullable(),
                  pace: z.number().nullable(),
                  type: z.string(),
                  status: z.enum(['PLANNED', 'COMPLETED']),
                  assignmentMode: z.enum(['GOAL', 'FREE']).nullable(),
                  date: z.coerce.date(),
                  notes: z.string().nullable(),
                  imageUrl: z.string().nullable(),
                  targetDistance: z.number().nullable().optional(),
                  targetDuration: z.number().nullable().optional(),
                  stravaActivityId: z.string().nullable().optional(),
                  syncSource: z.string().nullable().optional(),
                  createdAt: z.coerce.date(),
                  clubId: z.uuid(),
                  athlete: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                  club: z.object({
                    name: z.string(),
                    slug: z.string(),
                    avatarUrl: z.string().nullable(),
                  }),
                  reactions: z.array(
                    z.object({
                      type: z.string(),
                      count: z.number(),
                    })
                  ),
                  currentUserReaction: z.string().nullable().optional(),
                })
              ),
              meta: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                totalPages: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { page, limit, status, athleteId } = request.query
        const skip = (page - 1) * limit
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { can } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId
        )

        if (!can('get', 'Workout')) {
          throw new UnauthorizedError(`Você não tem permissão para listar os treinos deste clube`)
        }

        const where = {
          clubId: club.id,
          status,
          ...(athleteId ? { athleteId } : {}),
        }

        const [total, workouts] = await Promise.all([
          prisma.workout.count({
            where,
          }),
          prisma.workout.findMany({
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              clubId: true,
              distance: true,
              duration: true,
              pace: true,
              type: true,
              status: true,
              assignmentMode: true,
              date: true,
              notes: true,
              targetDistance: true,
              targetDuration: true,
              stravaActivityId: true,
              syncSource: true,
              createdAt: true,
              athlete: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              club: {
                select: {
                  name: true,
                  slug: true,
                  avatarUrl: true,
                },
              },
              reactions: {
                select: {
                  type: true,
                  userId: true,
                },
              },
            },
            where,
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip,
          }),
        ])

        const formattedWorkouts = workouts.map((workout) => {
          const reactionCounts: Record<string, number> = {}
          let currentUserReaction: string | null = null

          ;(workout.reactions || []).forEach((reaction) => {
            reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1
            if (reaction.userId === userId) {
              currentUserReaction = reaction.type
            }
          })

          const formattedReactions = Object.entries(reactionCounts).map(([type, count]) => ({
            type,
            count,
          }))

          const { reactions: _, ...rest } = workout

          return {
            ...rest,
            reactions: formattedReactions,
            currentUserReaction,
          }
        })

        return reply.send({
          workouts: formattedWorkouts,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        })
      }
    )
}
