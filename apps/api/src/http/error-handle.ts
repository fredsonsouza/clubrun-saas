import type { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'
import { ResourceNotFoundError } from './routes/_errors/resoruce-not-found-error'
type FastifyErrorHandler = FastifyInstance['errorHandler']
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error.code === 'FST_ERR_VALIDATION') {
    return reply.status(400).send({
      message: 'Validation error',
      errors: (error as any).validation,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }
 
  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }
 
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      message: error.message,
    })
  }
  console.error(error)
  // send error to some observability platform
  reply.status(500).send({ message: 'Internal server error' })
}
