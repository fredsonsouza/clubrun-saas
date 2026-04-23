import React from 'react'
import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'
import { InviteClient } from './invite-client'

interface InvitePageProps {
  params: Promise<{
    id: string
  }>
}

// --- MOCK DATA (No futuro buscar da API via ID) ---
const MOCK_INVITE_DETAILS = {
  id: 'inv-12345',
  club: {
    name: 'Macuxi Runner',
    description:
      'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
    location: 'Boa Vista, RR',
    membersCount: 84,
    avatarUrl: null,
  },
  inviter: {
    name: 'Fredson Souza',
    avatarUrl: 'https://github.com/fredsonsouza.png',
  },
  role: 'MEMBER',
  status: 'PENDING',
}

export default async function AcceptInvitePage({ params }: InvitePageProps) {
  const { id } = await params
  
  // Verifica se o usuário está logado. Se não, redireciona para o login 
  // e volta para esta página após autenticar.
  const session = await auth()
  
  if (!session) {
    redirect(`/auth/sign-in?callbackUrl=/invite/${id}`)
  }

  // Aqui faríamos a busca real: const invite = await getInvite(id)
  const invite = MOCK_INVITE_DETAILS

  return <InviteClient invite={invite} />
}
