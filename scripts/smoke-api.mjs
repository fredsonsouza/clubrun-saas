const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3333'

async function check(path, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`)
  const body = await response.text()
  if (response.status !== expectedStatus) {
    throw new Error(
      `${path}: expected ${expectedStatus}, got ${response.status}: ${body}`
    )
  }
  console.log(`${path}: ${response.status}`)
}

await check('/health', 200)
await check('/ready', 200)
