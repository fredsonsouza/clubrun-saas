import { api } from './api-client'

export async function acceptInvite(inviteId: string): Promise<void> {
  await api.post(`invites/${inviteId}/accept`).json()
}
