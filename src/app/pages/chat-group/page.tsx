'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import InstagramGroups from '@/components/InstagramGroups'

// Wrap the component in Suspense to handle useSearchParams
function ChatGroupContent() {
  return <InstagramGroups />
}

export default function ChatGroupPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatGroupContent />
    </Suspense>
  )
}
