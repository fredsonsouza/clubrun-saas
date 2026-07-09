import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

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
  const filePath = path.join(uploadDir, uniqueFileName)

  await pipeline(content, createWriteStream(filePath))

  // Retorna a URL pública (ajustar conforme o domínio da API)
  // Por enquanto usamos localhost:3333
  return {
    url: `http://localhost:3333/uploads/${uniqueFileName}`,
    key: uniqueFileName,
  }
}
