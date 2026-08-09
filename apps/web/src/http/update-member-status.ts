import { mutationApi } from './api-client'

export async function updateMemberStatus(
  slug: string,
  memberId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<void> {
  await mutationApi.patch(`clubs/${slug}/members/${memberId}/status`, {
    json: { status },
  })
}
