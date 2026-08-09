import { mutationApi } from './api-client'

export async function activateClubBilling(slug: string) {
  await mutationApi.patch(`clubs/${slug}/billing/activate`)
}
