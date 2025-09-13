'use client'

import React, { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ScreenHeaderProps = {
  title: string
  onMenuClick?: () => void
  rightImageSrc?: string
  showDivider?: boolean
  rightButtons?: React.ReactNode
  leftButtons?: React.ReactNode
  onTitleClick?: () => void
  timer?: React.ReactNode
}

export function ScreenHeader({ title, onMenuClick, rightImageSrc = '/logo.png', showDivider = true, rightButtons, leftButtons, onTitleClick, timer }: ScreenHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  const handleLogoClick = () => {
    router.push('/home')
  }

  return (
    <div className={`sticky top-0 z-50 bg-white/80 backdrop-blur-xl ${showDivider ? 'border-b border-gray-100/50' : ''}`}>
      <div className="flex items-center justify-between p-4 relative">
        {/* Left side - Menu button and left buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onMenuClick}
            className={`flex items-center p-2 rounded-lg transition-all duration-1000 ease-out focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}
            aria-label="Open menu"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          {leftButtons && (
            <div className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}>
              {leftButtons}
            </div>
          )}
        </div>
        
        {/* Center - Title and Timer (centered on all screen sizes) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <button 
            onClick={onTitleClick}
            className={`text-base sm:text-lg font-outfit-semibold text-gray-800 transition-all duration-1000 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'} ${onTitleClick ? 'hover:text-gray-900 active:scale-95' : 'cursor-default'}`}
            disabled={!onTitleClick}
          >
            {title}
          </button>
          {timer && (
            <div className={`mt-0.5 transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {timer}
            </div>
          )}
        </div>
        
        {/* Right side - Buttons and Logo */}
        <div className={`flex items-center space-x-2 transition-all duration-1000 ease-out delay-400 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'}`}>
          {rightButtons}
          <button
            onClick={handleLogoClick}
            className="hover:scale-105 active:scale-95 transition-transform duration-200"
            aria-label="Go to home"
          >
            <img 
              src={rightImageSrc} 
              alt="Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScreenHeader


