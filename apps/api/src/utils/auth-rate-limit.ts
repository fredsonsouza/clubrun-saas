import { createHash } from 'node:crypto'
import type { FastifyRequest } from 'fastify'

function rateLimitDigest(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function authRateLimit(
  identifier: (request: FastifyRequest) => string,
  max = 5,
  timeWindow = '1 minute'
) {
  return {
    rateLimit: {
      max,
      timeWindow,
      keyGenerator(request: FastifyRequest) {
        return `${request.ip}:${rateLimitDigest(identifier(request))}`
      },
    },
  }
}
