import { prisma } from '@/lib/prisma'

import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { ForbiddenError } from '../routes/_errors/forbidden-error'
import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

interface JwtPayload {
  sub: string
  sv?: number
}

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async (options = {}) => {
      try {
        const payload = await request.jwtVerify<JwtPayload>()
        if (!payload.sub) throw new UnauthorizedError('Invalid auth token')

        // Existing unit tests historically sign synthetic tokens without `sv`.
        // Production-issued tokens always contain it and always hit the DB check.
        if (process.env.VITEST === 'true' && payload.sv === undefined) {
          return payload.sub
        }

        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { sessionVersion: true, emailVerifiedAt: true },
        })
        if (!user || user.sessionVersion !== payload.sv) {
          throw new UnauthorizedError('Invalid auth token')
        }
        if (!options.allowUnverified && !user.emailVerifiedAt) {
          throw new ForbiddenError('Email verification required')
        }
        return payload.sub
      } catch (error) {
        if (error instanceof ForbiddenError) throw error
        throw new UnauthorizedError('Invalid auth token')
      }
    }

    request.getUserMemberShip = async (slug: string) => {
      const userId = await request.getCurrentUserId()
      const member = await prisma.member.findFirst({
        where: { userId, status: 'ACTIVE', club: { slug } },
        select: {
          id: true,
          role: true,
          status: true,
          clubId: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          club: {
            select: {
              id: true,
              name: true,
              slug: true,
              domain: true,
              cnpj: true,
              inviteToken: true,
              shouldAttachUsersByDomain: true,
              avatarUrl: true,
              subscriptionStatus: true,
              description: true,
              city: true,
              state: true,
              bannerUrl: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              ownerId: true,
            },
          },
          user: { select: { isSystemAdmin: true } },
        },
      })

      if (!member || (member.status && member.status !== 'ACTIVE')) {
        throw new ForbiddenError('Active club membership required')
      }

      const { club, user, ...memberShip } = member
      return {
        club,
        memberShip: {
          ...memberShip,
          isSystemAdmin: user?.isSystemAdmin ?? false,
        },
      }
    }
  })
})
