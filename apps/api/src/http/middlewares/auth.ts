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

      const userFromDb = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerifiedAt: true },
      })

      /* Temporariamente desativado para facilitar o desenvolvimento
      if (!userFromDb?.emailVerifiedAt) {
        throw new UnauthorizedError('Por favor, verifique seu e-mail para acessar os recursos do clube.')
      }
      */

      const member = await prisma.member.findFirst({
        where: {
          userId,
          club: {
            slug,
          },
        },
        include: {
          club: true,
          user: {
            select: {
              isSystemAdmin: true,
            }
          }
        },
      })
      if (!member) {
        console.error(`[ERROR] Membro não encontrado para User=${userId} no clube ${slug}`)
        throw new UnauthorizedError(`You're not a member of this club`)
      }

      const { club, user, ...memberShip } = member
      
      return {
        club,
        memberShip: {
          ...memberShip,
          isSystemAdmin: user?.isSystemAdmin ?? false,
        }
      }
    }
  })
})
