import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { UnauthorizedError } from '../routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }

    request.getUserMemberShip = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: {
          userId,
          club: {
            slug,
          },
        },
        include: {
          club: true,
        },
      })
      if (!member) {
        throw new UnauthorizedError(`You're note a member of this club`)
      }

      const { club, ...memberShip } = member

      return {
        club,
        memberShip,
      }
    }
  })
})
