import { mutationApi } from './api-client'

export async function acceptInvite(inviteId: string): Promise<void> {
  await mutationApi.post(`invites/${inviteId}/accept`).json()
}
