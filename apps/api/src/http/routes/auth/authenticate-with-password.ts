import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { hashPassword, normalizeEmail, verifyPassword } from '@/utils/identity'
import { issueAccessToken } from '@/utils/jwt'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { login?: string }
        const login = body.login ?? ''
        return login.includes('@') ? normalizeEmail(login) : login
      }),
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({ login: z.string(), password: z.string().max(128) }),
        response: { 201: z.object({ token: z.string() }) },
      },
    },
    async (request, reply) => {
      const { password } = request.body
      const login = request.body.login.includes('@')
        ? normalizeEmail(request.body.login)
        : request.body.login

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: login }, { username: login }] },
        select: {
          id: true,
          passwordHash: true,
          sessionVersion: true,
        },
      })

      if (!user?.passwordHash) {
        createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entity: 'USER',
          entityId: user?.id ?? 'SYSTEM',
          payload: {
            reason: user ? 'missing_password_hash' : 'user_not_found',
          },
        })
        throw new BadRequestError('Invalid credentials')
      }

      const verification = await verifyPassword(password, user.passwordHash)
      if (!verification.valid) {
        createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entity: 'USER',
          entityId: user.id,
          payload: { reason: 'invalid_password' },
        })
        throw new BadRequestError('Invalid credentials')
      }

      if (verification.needsRehash) {
        const passwordHash = await hashPassword(password)
        await prisma.user.update({
          where: { id: user.id, passwordHash: user.passwordHash },
          data: { passwordHash },
        })
      }

      const token = await issueAccessToken(reply, user)
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
