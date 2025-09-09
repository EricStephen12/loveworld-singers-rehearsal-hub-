'use client'

import React, { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

type ScreenHeaderProps = {
  title: string
  onMenuClick?: () => void
  rightImageSrc?: string
  showDivider?: boolean
  rightButtons?: React.ReactNode
}

export function ScreenHeader({ title, onMenuClick, rightImageSrc = '/logo.png', showDivider = true, rightButtons }: ScreenHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className={`flex items-center justify-between p-4 bg-white ${showDivider ? 'border-b border-gray-200' : ''}`}>
      <button 
        onClick={onMenuClick}
        className={`flex items-center p-2 rounded-lg transition-all duration-1000 ease-out focus:outline-none focus:ring-0 hover:bg-gray-100 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
      <h1 className={`text-lg font-semibold text-gray-800 transition-all duration-1000 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'}`}>
        {title}
      </h1>
      <div className={`flex items-center space-x-2 transition-all duration-1000 ease-out delay-400 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'}`}>
        {rightButtons}
        <img 
          src={rightImageSrc} 
          alt="Logo" 
          className="w-8 h-8 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}

export default ScreenHeader


