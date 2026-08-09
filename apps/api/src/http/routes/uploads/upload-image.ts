import { auth } from '@/http/middlewares/auth'
import { uploadFile } from '@/lib/storage'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_IMAGE_PIXELS = 40_000_000
const MAX_IMAGE_EDGE = 12_000

const SUPPORTED_IMAGE_MIME_TYPES = new Map([
  ['image/jpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

interface DecodedImageMetadata {
  format?: string
  width?: number
  height?: number
  pages?: number
}

export function validateDecodedImage(
  declaredMimeType: string,
  metadata: DecodedImageMetadata
) {
  const expectedFormat = SUPPORTED_IMAGE_MIME_TYPES.get(declaredMimeType)

  if (!expectedFormat || metadata.format !== expectedFormat) {
    throw new BadRequestError(
      'O conteúdo da imagem não corresponde a um formato suportado.'
    )
  }

  const { width, height } = metadata
  const pages = metadata.pages ?? 1

  if (!width || !height || pages !== 1) {
    throw new BadRequestError('A imagem enviada é inválida ou animada.')
  }

  if (
    width > MAX_IMAGE_EDGE ||
    height > MAX_IMAGE_EDGE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new BadRequestError('A imagem excede o limite permitido de pixels.')
  }
}

async function decodeAndReencodeImage(
  input: Buffer,
  declaredMimeType: string
): Promise<Buffer> {
  const { default: sharp } = await import('sharp')
  const image = sharp(input, {
    failOn: 'error',
    limitInputPixels: MAX_IMAGE_PIXELS,
    sequentialRead: true,
  })

  let metadata: DecodedImageMetadata

  try {
    metadata = await image.metadata()
    validateDecodedImage(declaredMimeType, metadata)

    return await image.rotate().webp({ quality: 82 }).toBuffer()
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error
    }

    throw new BadRequestError('Não foi possível decodificar a imagem enviada.')
  }
}

export async function uploadImage(app: FastifyInstance) {
  const limitByIp = app.rateLimit({
    max: 20,
    timeWindow: '1 minute',
    groupId: 'upload-by-ip',
    keyGenerator: (request) => `upload:ip:${request.ip}`,
  })
  const limitByUser = app.rateLimit({
    max: 5,
    timeWindow: '1 minute',
    groupId: 'upload-by-user',
    keyGenerator: (request) => {
      const user = request.user as { sub?: string }
      return `upload:user:${user.sub ?? 'anonymous'}`
    },
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/uploads',
      {
        preHandler: [
          async (request) => request.getCurrentUserId(),
          limitByUser,
          limitByIp,
        ],
        schema: {
          tags: ['uploads'],
          summary: 'Upload and safely normalize an image',
          security: [{ bearerAuth: [] }],
          consumes: ['multipart/form-data'],
          response: {
            201: z.object({
              url: z.string().url(),
              key: z.string().regex(/^[0-9a-f-]+\.webp$/),
            }),
          },
        },
      },
      async (request, reply) => {
        let upload: { content: Buffer; mimetype: string } | null = null

        for await (const part of request.parts({
          limits: {
            fileSize: MAX_UPLOAD_BYTES,
            files: 1,
            fields: 0,
            parts: 1,
          },
        })) {
          if (part.type !== 'file' || part.fieldname !== 'file' || upload) {
            throw new BadRequestError(
              'Envie exatamente uma imagem no campo "file".'
            )
          }

          if (!SUPPORTED_IMAGE_MIME_TYPES.has(part.mimetype)) {
            throw new BadRequestError('Formato de imagem não suportado.')
          }

          const content = await part.toBuffer()

          if (part.file.truncated || content.length > MAX_UPLOAD_BYTES) {
            throw new BadRequestError('A imagem excede o limite de 5 MiB.')
          }

          upload = { content, mimetype: part.mimetype }
        }

        if (!upload) {
          throw new BadRequestError(
            'Envie exatamente uma imagem no campo "file".'
          )
        }

        const normalizedImage = await decodeAndReencodeImage(
          upload.content,
          upload.mimetype
        )
        const storedImage = await uploadFile({
          content: normalizedImage,
          extension: 'webp',
        })

        return reply.status(201).send(storedImage)
      }
    )
}
