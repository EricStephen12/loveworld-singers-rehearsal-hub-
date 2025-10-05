'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InstagramGroups from '@/components/InstagramGroups'

export default function GroupsPage() {
  const router = useRouter()
  const [showChat, setShowChat] = useState(true)

  return (
    <InstagramGroups />
  )
}
