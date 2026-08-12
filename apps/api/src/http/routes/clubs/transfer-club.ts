import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { clubSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ConflictError } from '../_errors/conflict-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function transferClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/owner',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Transfer club ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.uuid(),
            leaveAfterTransfer: z.boolean().default(false),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (club.ownerId !== userId || memberShip.role !== 'OWNER') {
          throw new ForbiddenError(
            'Only the current club owner can transfer ownership.'
          )
        }

        if (club.status === 'DEACTIVATED') {
          throw new ForbiddenError(
            'This club is deactivated and cannot transfer ownership.'
          )
        }

        const authClub = clubSchema.parse(club)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )

        if (cannot('transfer_ownership', authClub)) {
          throw new ForbiddenError(
            `You're not allowed to transfer this club ownership`
          )
        }

        const { transferToUserId, leaveAfterTransfer } = request.body

        if (transferToUserId === userId) {
          throw new BadRequestError(
            'Club ownership is already assigned to this user'
          )
        }

        const transferToMembership = await prisma.member.findUnique({
          where: {
            clubId_userId: {
              clubId: club.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMembership || transferToMembership.status !== 'ACTIVE') {
          throw new BadRequestError(
            'Target user must be an active member of this club'
          )
        }

        await prisma.$transaction(async (tx) => {
          const currentOwner = await tx.member.updateMany({
            where: {
              clubId: club.id,
              userId,
              role: 'OWNER',
              status: 'ACTIVE',
            },
            data: { role: 'ATHLETE' },
          })
          if (currentOwner.count !== 1) {
            throw new ConflictError('Ownership was changed by another request.')
          }

          const targetOwner = await tx.member.updateMany({
            where: {
              clubId: club.id,
              userId: transferToUserId,
              role: { not: 'OWNER' },
              status: 'ACTIVE',
            },
            data: { role: 'OWNER' },
          })
          if (targetOwner.count !== 1) {
            throw new ConflictError('Target membership is no longer active.')
          }

          if (leaveAfterTransfer) {
            const removed = await tx.member.deleteMany({
              where: { clubId: club.id, userId, role: 'ATHLETE' },
            })
            if (removed.count !== 1) {
              throw new ConflictError(
                'Previous owner could not leave the club.'
              )
            }
          }

          const clubUpdate = await tx.club.updateMany({
            where: { id: club.id, ownerId: userId, status: 'ACTIVE' },
            data: {
              ownerId: transferToUserId,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              subscriptionStatus: 'PENDING_UPDATE',
            },
          })
          if (clubUpdate.count !== 1) {
            throw new ConflictError('Ownership was changed by another request.')
          }

          // Registrar no AuditLog
          await tx.auditLog.create({
            data: {
              action: 'TRANSFER_OWNERSHIP',
              entity: 'CLUB',
              entityId: club.id,
              userId,
              payload: {
                from: userId,
                to: transferToUserId,
                leftClub: leaveAfterTransfer,
              },
            },
          })
        })

        return reply.status(204).send(null)
      }
    )
}
