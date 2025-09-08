'use client'

import { useEffect, useRef } from 'react'
import Logo from '../../public/logo.png'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // When video ends, complete the splash screen
      const handleVideoEnd = () => {
        onComplete()
      }
      
      video.addEventListener('ended', handleVideoEnd)
      
      // Fallback timer in case video doesn't load or play
      const fallbackTimer = setTimeout(() => {
        onComplete()
      }, 5000) // 5 second fallback
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd)
        clearTimeout(fallbackTimer)
      }
    } else {
      // If video doesn't load, use fallback timer
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      {/* Logo with bounce animation */}
      <img 
        src="/logo.png" 
        alt="LoveWorld Praise Logo" 
        className="object-contain animate-bounce"
        style={{ 
          width: '120px', 
          height: '120px',
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out'
        }}
      />
    </div>
  )
}
