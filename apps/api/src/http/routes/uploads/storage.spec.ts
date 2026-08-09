import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { uploadFile } from '@/lib/storage'
import { afterEach, describe, expect, it, vi } from 'vitest'

const temporaryDirectories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe('Local image storage (Unit)', () => {
  it('atomically persists only a server-generated webp key', async () => {
    const uploadDirectory = await mkdtemp(
      path.join(tmpdir(), 'club-run-upload-test-')
    )
    temporaryDirectories.push(uploadDirectory)
    vi.stubEnv('UPLOAD_DIR', uploadDirectory)
    const content = Buffer.from('normalized-image')

    const stored = await uploadFile({ content, extension: 'webp' })
    const entries = await readdir(uploadDirectory)

    expect(stored.key).toMatch(/^[0-9a-f-]+\.webp$/)
    expect(entries).toEqual([stored.key])
    expect(entries.some((entry) => entry.startsWith('.'))).toBe(false)
    await expect(readFile(path.join(uploadDirectory, stored.key))).resolves.toEqual(
      content
    )
  })
})
