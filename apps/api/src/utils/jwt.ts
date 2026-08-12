import type { FastifyReply } from 'fastify'

export interface AccessTokenUser {
  id: string
  sessionVersion: number
}

export function issueAccessToken(
  reply: FastifyReply,
  user: AccessTokenUser
): Promise<string> {
  return reply.jwtSign({ sub: user.id, sv: user.sessionVersion })
}
