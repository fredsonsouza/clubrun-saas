import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({
          login: z.string(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { login, password } = request.body

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: login }, { username: login }],
        },
      })

      if (!user) {
        createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entity: 'USER',
          entityId: 'SYSTEM',
          payload: { login, reason: 'user_not_found' },
        })
        throw new BadRequestError('Invalid credentials')
      }

      if (user.passwordHash === null) {
        createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entity: 'USER',
          entityId: user.id,
          payload: { reason: 'missing_password_hash' },
        })
        throw new BadRequestError(
          'User does not have a password, use social login'
        )
      }

      const isPasswordValid = await compare(password, user.passwordHash)

      if (!isPasswordValid) {
        createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entity: 'USER',
          entityId: user.id,
          payload: { reason: 'invalid_password' },
        })
        throw new BadRequestError('Invalid credentials')
      }

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user.id,
            expiresIn: '7d',
          },
        }
      )

      createAuditLog({
        action: 'USER_LOGIN',
        entity: 'USER',
        entityId: user.id,
        userId: user.id,
        payload: { method: 'password' },
      })

      return reply.status(201).send({ token })
    }
  )
}
