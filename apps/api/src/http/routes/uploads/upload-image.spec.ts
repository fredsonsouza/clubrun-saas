import { app } from '@/http/server'
import {
  MAX_IMAGE_PIXELS,
  validateDecodedImage,
} from '@/http/routes/uploads/upload-image'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))

function multipartBody(mimetype: string, content: string) {
  const boundary = 'club-run-test-boundary'
  const body = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="image.bin"\r\n` +
      `Content-Type: ${mimetype}\r\n\r\n` +
      `${content}\r\n` +
      `--${boundary}--\r\n`
  )

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  }
}

describe('Secure image upload (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  it('requires a valid JWT before parsing an upload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/uploads',
    })

    expect(response.statusCode).toBe(401)
  })

  it('rejects unsupported declared MIME types before decoding', async () => {
    const multipart = multipartBody('text/plain', 'not-an-image')
    const response = await app.inject({
      method: 'POST',
      url: '/uploads',
      headers: {
        authorization: `Bearer ${app.jwt.sign({ sub: 'user-id' })}`,
        'content-type': multipart.contentType,
      },
      payload: multipart.body,
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Formato de imagem não suportado.')
  })

  it('rejects a declared MIME that does not match decoded content', () => {
    expect(() =>
      validateDecodedImage('image/png', {
        format: 'jpeg',
        width: 100,
        height: 100,
      })
    ).toThrow('não corresponde a um formato suportado')
  })

  it('rejects decoded images above the pixel limit', () => {
    expect(() =>
      validateDecodedImage('image/png', {
        format: 'png',
        width: MAX_IMAGE_PIXELS / 1000 + 1,
        height: 1000,
      })
    ).toThrow('excede o limite permitido de pixels')
  })
})
