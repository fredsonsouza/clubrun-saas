import { api } from './api-client'

export async function updateMemberStatus(
  slug: string, 
  memberId: string, 
  status: 'ACTIVE' | 'INACTIVE'
): Promise<void> {
  await api.patch(`clubs/${slug}/members/${memberId}/status`, {
    json: { status }
  })
}
