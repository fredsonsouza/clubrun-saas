import { randomUUID } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export interface PutImageInput {
  content: Buffer
  extension: 'webp'
  key?: string
}

export interface StoredImage {
  key: string
  url: string
}

export interface ImageStorage {
  put(input: PutImageInput): Promise<StoredImage>
  delete(key: string): Promise<void>
}

export interface ObjectStorageClient {
  putObject(input: {
    key: string
    content: Buffer
    contentType: 'image/webp'
  }): Promise<void>
  deleteObject(key: string): Promise<void>
}

export function createObjectStorage(options: {
  client: ObjectStorageClient
  publicBaseUrl: string
}): ImageStorage {
  const publicBaseUrl = options.publicBaseUrl.replace(/\/$/, '')

  return {
    async put({ content, extension, key: requestedKey }) {
      const key = requestedKey ?? `${randomUUID()}.${extension}`
      if (!/^[0-9a-f-]+\.webp$/.test(key)) {
        throw new Error('Invalid image storage key')
      }
      await options.client.putObject({
        key,
        content,
        contentType: 'image/webp',
      })
      return { key, url: `${publicBaseUrl}/${key}` }
    },
    async delete(key) {
      if (!/^[0-9a-f-]+\.webp$/.test(key)) {
        throw new Error('Invalid image storage key')
      }
      await options.client.deleteObject(key)
    },
  }
}

export function createS3ImageStorage(options: {
  client: S3Client
  bucket: string
  publicBaseUrl: string
}): ImageStorage {
  const publicBaseUrl = options.publicBaseUrl.replace(/\/$/, '')
  return createObjectStorage({
    publicBaseUrl,
    client: {
      async putObject({ key, content, contentType }) {
        await options.client.send(
          new PutObjectCommand({
            Bucket: options.bucket,
            Key: key,
            Body: content,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
      },
      async deleteObject(key) {
        await options.client.send(
          new DeleteObjectCommand({ Bucket: options.bucket, Key: key })
        )
      },
    },
  })
}

export const fakeImageStorage: ImageStorage = {
  async put({ extension, key }) {
    const storedKey = key ?? `${randomUUID()}.${extension}`
    return { key: storedKey, url: `https://storage.invalid/${storedKey}` }
  },
  async delete() {},
}

export function getUploadDirectory() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'A produção exige um adapter de object storage; storage local está bloqueado.'
    )
  }

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

export const localImageStorage: ImageStorage = {
  async put({ content, extension, key: requestedKey }) {
    const uploadDirectory = getUploadDirectory()
    const key = requestedKey ?? `${randomUUID()}.${extension}`
    if (!/^[0-9a-f-]+\.webp$/.test(key)) {
      throw new Error('Invalid image storage key')
    }
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
  },
  async delete(key) {
    if (!/^[0-9a-f-]+\.webp$/.test(key)) {
      throw new Error('Invalid image storage key')
    }
    await rm(path.join(getUploadDirectory(), key), { force: true })
  },
}

function createConfiguredImageStorage(): ImageStorage {
  const provider = process.env.IMAGE_STORAGE_PROVIDER ?? 'local'

  if (provider === 'fake') return fakeImageStorage
  if (provider === 'local') return localImageStorage
  if (provider === 's3') {
    const bucket = process.env.IMAGE_STORAGE_BUCKET
    const publicBaseUrl = process.env.IMAGE_STORAGE_PUBLIC_BASE_URL
    if (!bucket || !publicBaseUrl) {
      throw new Error(
        'S3 exige IMAGE_STORAGE_BUCKET e IMAGE_STORAGE_PUBLIC_BASE_URL.'
      )
    }
    const client = new S3Client({
      region: process.env.IMAGE_STORAGE_REGION ?? 'auto',
      endpoint: process.env.IMAGE_STORAGE_ENDPOINT || undefined,
      forcePathStyle: process.env.IMAGE_STORAGE_FORCE_PATH_STYLE === 'true',
      credentials:
        process.env.IMAGE_STORAGE_ACCESS_KEY_ID &&
        process.env.IMAGE_STORAGE_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.IMAGE_STORAGE_ACCESS_KEY_ID,
              secretAccessKey: process.env.IMAGE_STORAGE_SECRET_ACCESS_KEY,
            }
          : undefined,
    })
    return createS3ImageStorage({ client, bucket, publicBaseUrl })
  }

  throw new Error(`IMAGE_STORAGE_PROVIDER=${provider} não suportado.`)
}

export const imageStorage: ImageStorage = createConfiguredImageStorage()

export async function uploadFile(input: PutImageInput) {
  return imageStorage.put(input)
}

export async function deleteFile(key: string) {
  return imageStorage.delete(key)
}
