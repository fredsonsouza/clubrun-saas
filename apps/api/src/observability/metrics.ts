export interface MetricsSnapshot {
  requests: number
  errors: number
  totalRequestDurationMs: number
  startedAt: string
}

const snapshot: MetricsSnapshot = {
  requests: 0,
  errors: 0,
  totalRequestDurationMs: 0,
  startedAt: new Date().toISOString(),
}

export function recordRequest(input: {
  durationMs: number
  statusCode: number
}) {
  snapshot.requests += 1
  snapshot.totalRequestDurationMs += input.durationMs
  if (input.statusCode >= 500) snapshot.errors += 1
}

export function getMetricsSnapshot(): MetricsSnapshot & {
  averageRequestDurationMs: number
} {
  return {
    ...snapshot,
    averageRequestDurationMs:
      snapshot.requests === 0
        ? 0
        : snapshot.totalRequestDurationMs / snapshot.requests,
  }
}

export function resetMetrics() {
  snapshot.requests = 0
  snapshot.errors = 0
  snapshot.totalRequestDurationMs = 0
  snapshot.startedAt = new Date().toISOString()
}
