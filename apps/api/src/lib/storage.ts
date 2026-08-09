import { randomUUID } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

interface UploadParams {
  content: Buffer
  extension: 'webp'
}

export function getUploadDirectory() {
  const configuredDirectory = process.env.UPLOAD_DIR?.trim()

  if (configuredDirectory) {
    return path.resolve(configuredDirectory)
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    return path.resolve(process.cwd(), 'uploads')
  }

  throw new Error(
    'UPLOAD_DIR must be configured outside development and test environments.'
  )
}

export async function uploadFile({ content, extension }: UploadParams) {
  const uploadDirectory = getUploadDirectory()
  const key = `${randomUUID()}.${extension}`
  const temporaryPath = path.join(
    uploadDirectory,
    `.${randomUUID()}.${extension}.tmp`
  )
  const finalPath = path.join(uploadDirectory, key)

  await mkdir(uploadDirectory, { recursive: true, mode: 0o750 })

  try {
    await writeFile(temporaryPath, content, {
      flag: 'wx',
      mode: 0o640,
    })
    await rename(temporaryPath, finalPath)
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
    throw error
  }

  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
  ).replace(/\/$/, '')

  return {
    url: `${apiBaseUrl}/uploads/${key}`,
    key,
  }
}
