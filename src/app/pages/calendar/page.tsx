'use client'

import React from 'react'
import { Calendar, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-gray-50/80 backdrop-blur-sm p-4 justify-between border-b border-gray-200">
            <button
          onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center text-gray-900"
            >
          <ArrowLeft className="w-5 h-5" />
            </button>
        <h1 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Calendar
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Coming Soon Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-purple-600" />
      </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            We're working on something amazing! The calendar feature will be available soon.
          </p>
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <p className="text-sm text-purple-800">
              Stay tuned for updates on upcoming rehearsals, events, and important dates.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
