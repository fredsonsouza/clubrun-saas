export class ResourceNotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Not found')
  }
}
