import React from 'react'
import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'
import { CheckoutClient } from './checkout-client'

export default async function CheckoutPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in?redirectTo=/checkout')
  }

  return (
    <CheckoutClient 
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }} 
    />
  )
}
