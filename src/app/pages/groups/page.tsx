'use client'

import { useState } from 'react'
import WhatsAppLikeChat from '@/components/WhatsAppLikeChat'

export default function GroupsPage() {
  const [showChat, setShowChat] = useState(true)

  return (
    <WhatsAppLikeChat 
      isOpen={showChat} 
      onClose={() => setShowChat(false)} 
    />
  )
}
