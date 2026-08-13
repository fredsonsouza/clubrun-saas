import { randomUUID } from 'node:crypto'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { ConflictError } from '@/http/routes/_errors/conflict-error'
import type { FastifyError, FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'
import { ForbiddenError } from './routes/_errors/forbidden-error'
import { ResourceNotFoundError } from './routes/_errors/resource-not-found-error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  const fastifyError = error as FastifyError
  const incidentId = randomUUID()
  const logContext = { incidentId, method: request.method, url: request.url }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      fieldErrors: z.flattenError(error).fieldErrors,
    })
  }

  if (fastifyError.code === 'FST_ERR_VALIDATION') {
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      fieldErrors: (error as any).validation,
    })
  }

  if (error instanceof ConflictError) {
    return reply.status(409).send({
      code: 'CONFLICT',
      message: error.message,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      code: 'BAD_REQUEST',
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: error.message,
    })
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      code: 'NOT_FOUND',
      message: error.message,
    })
  }

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      code: 'FORBIDDEN',
      message: error.message,
    })
  }

  if (fastifyError.statusCode) {
    return reply.status(fastifyError.statusCode).send({
      code: 'HTTP_ERROR',
      message: fastifyError.message,
    })
  }
  console.error(
    JSON.stringify({
      ...logContext,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  )
  reply.status(500).send({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    incidentId,
  })
}
