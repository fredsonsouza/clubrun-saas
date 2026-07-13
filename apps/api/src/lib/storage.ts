import { randomUUID } from 'node:crypto'
import { createWriteStream, mkdirSync } from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { env } from '@saas/env'

interface UploadParams {
  filename: string
  mimetype: string
  content: any // Multiparts stream
}

export async function uploadFile({
  filename,
  mimetype,
  content,
}: UploadParams) {
  const fileExtension = path.extname(filename)
  const uniqueFileName = `${randomUUID()}${fileExtension}`

  const uploadDir = path.resolve(__dirname, '../../uploads')
  
  // Garantir que a pasta de uploads existe
  mkdirSync(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, uniqueFileName)

  await pipeline(content, createWriteStream(filePath))

  // Retorna a URL pública baseada no domínio configurado da API
  const apiBaseUrl = env.NEXT_PUBLIC_API_URL ? env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:3333'
  return {
    url: `${apiBaseUrl}/uploads/${uniqueFileName}`,
    key: uniqueFileName,
  }
}
