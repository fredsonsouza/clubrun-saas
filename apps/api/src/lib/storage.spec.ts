import { describe, expect, it, vi } from 'vitest'
import { createObjectStorage, fakeImageStorage } from './storage'

describe('ImageStorage contract', () => {
  it('uses a stable key and delegates object writes/deletes', async () => {
    const client = {
      putObject: vi.fn().mockResolvedValue(undefined),
      deleteObject: vi.fn().mockResolvedValue(undefined),
    }
    const storage = createObjectStorage({
      client,
      publicBaseUrl: 'https://cdn.example.com/media/',
    })

    await expect(
      storage.put({
        content: Buffer.from('webp'),
        extension: 'webp',
        key: '11111111-1111-1111-1111-111111111111.webp',
      })
    ).resolves.toEqual({
      key: '11111111-1111-1111-1111-111111111111.webp',
      url: 'https://cdn.example.com/media/11111111-1111-1111-1111-111111111111.webp',
    })

    expect(client.putObject).toHaveBeenCalledWith({
      key: '11111111-1111-1111-1111-111111111111.webp',
      content: Buffer.from('webp'),
      contentType: 'image/webp',
    })

    await storage.delete('11111111-1111-1111-1111-111111111111.webp')
    expect(client.deleteObject).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111.webp'
    )
  })

  it('rejects traversal and unsupported keys', async () => {
    const client = {
      putObject: vi.fn(),
      deleteObject: vi.fn(),
    }
    const storage = createObjectStorage({
      client,
      publicBaseUrl: 'https://cdn.example.com/media',
    })

    await expect(
      storage.put({
        content: Buffer.from('x'),
        extension: 'webp',
        key: '../x.webp',
      })
    ).rejects.toThrow('Invalid image storage key')
    await expect(storage.delete('../x.webp')).rejects.toThrow(
      'Invalid image storage key'
    )
  })

  it('provides a deterministic fake adapter for tests', async () => {
    await expect(
      fakeImageStorage.put({
        content: Buffer.from('webp'),
        extension: 'webp',
        key: 'fake.webp',
      })
    ).resolves.toEqual({
      key: 'fake.webp',
      url: 'https://storage.invalid/fake.webp',
    })
  })
})
