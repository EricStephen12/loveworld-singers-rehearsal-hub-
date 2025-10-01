'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import WhatsAppLikeChat from '@/components/WhatsAppLikeChat'

export default function GroupsPage() {
  const router = useRouter()
  const [showChat, setShowChat] = useState(true)

    return (
    <WhatsAppLikeChat 
      isOpen={showChat} 
      onClose={() => router.push('/home')} 
    />
  )
}
