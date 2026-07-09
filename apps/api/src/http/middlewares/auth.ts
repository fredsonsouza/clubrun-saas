import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

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

      /* Temporariamente desativado para facilitar o desenvolvimento
      const userFromDb = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerifiedAt: true },
      })

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
            },
          },
        },
      })

      // Se não for membro OU se o status for PENDING/INACTIVE, retorna como VISITOR
      const isVisitor =
        !member || member.status === 'PENDING' || member.status === 'INACTIVE'
      if (isVisitor) {
        const [club, user] = await Promise.all([
          member?.club || prisma.club.findFirst({ where: { slug } }),
          member?.user ||
            prisma.user.findUnique({
              where: { id: userId },
              select: { isSystemAdmin: true },
            }),
        ])

        if (!club) {
          throw new UnauthorizedError(`Clube não encontrado.`)
        }

        return {
          club,
          memberShip: {
            id: member?.id || 'visitor',
            userId,
            role: 'VISITOR' as const,
            status: member?.status || 'INACTIVE',
            clubId: club.id,
            isSystemAdmin: user?.isSystemAdmin ?? false,
          },
        }
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
