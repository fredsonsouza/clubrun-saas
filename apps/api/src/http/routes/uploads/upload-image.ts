import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '@/http/middlewares/auth'
import { uploadFile } from '@/lib/storage'
import { BadRequestError } from '../_errors/bad-request-error'
import fastifyMultipart from '@fastify/multipart'

export async function uploadImage(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5mb
    },
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/uploads',
      {
        schema: {
          tags: ['uploads'],
          summary: 'Upload an image',
          security: [{ bearerAuth: [] }],
          response: {
            201: z.object({
              url: z.string().url(),
            }),
          },
        },
      },
      async (request, reply) => {
        const data = await request.file()

        if (!data) {
          throw new BadRequestError('Nenhum arquivo enviado.')
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

        if (!allowedMimeTypes.includes(data.mimetype)) {
          throw new BadRequestError('Formato de arquivo inválido. Use JPEG, PNG ou WebP.')
        }

        const { url } = await uploadFile({
          filename: data.filename,
          mimetype: data.mimetype,
          content: data.file,
        })

        return reply.status(201).send({ url })
      }
    )
}
