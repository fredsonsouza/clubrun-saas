export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message ?? 'Ação proibida para este usuário.')
  }
}
