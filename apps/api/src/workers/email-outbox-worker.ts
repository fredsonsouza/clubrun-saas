import { processPendingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

const POLL_INTERVAL_MS = Number(process.env.EMAIL_WORKER_POLL_MS ?? 5_000)

export async function runEmailOutboxOnce() {
  return processPendingEmail(prisma)
}

export async function runEmailOutboxWorker(options?: {
  signal?: AbortSignal
  pollIntervalMs?: number
}) {
  const signal = options?.signal ?? new AbortController().signal
  const pollIntervalMs = options?.pollIntervalMs ?? POLL_INTERVAL_MS

  while (!signal.aborted) {
    await runEmailOutboxOnce()
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, pollIntervalMs)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          resolve()
        },
        { once: true }
      )
    })
  }
}

if (process.argv[1]?.endsWith('email-outbox-worker.ts')) {
  const controller = new AbortController()
  const shutdown = () => controller.abort()
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  runEmailOutboxWorker({ signal: controller.signal })
    .catch((error) => {
      console.error('Email outbox worker stopped unexpectedly')
      console.error(
        error instanceof Error ? error.message : 'Unknown worker error'
      )
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
