'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronRight, Calendar, Users, Music, Clock, MapPin, Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'

export default function RehearsalsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleTitleClick = () => {
    router.push('/home')
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('hasCompletedProfile')
    localStorage.removeItem('hasSubscribed')
    
    // Redirect to auth screen
    router.push('/auth')
  }

  // Carousel for rehearsal images
  const images = useMemo(() => [
    "/images/DSC_6155_scaled.jpg",
    "/images/DSC_6303_scaled.jpg", 
    "/images/DSC_6446_scaled.jpg",
    "/images/DSC_6506_scaled.jpg",
    "/images/DSC_6516_scaled.jpg",
    "/images/DSC_6636_1_scaled.jpg",
    "/images/DSC_6638_scaled.jpg",
    "/images/DSC_6644_scaled.jpg",
    "/images/DSC_6658_1_scaled.jpg",
    "/images/DSC_6676_scaled.jpg"
  ], [])

  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const getStep = () => {
      const firstCard = el.querySelector<HTMLElement>("[data-card]")
      const gap = parseFloat(window.getComputedStyle(el).gap || "12")
      const width = firstCard?.offsetWidth || 280
      return width + gap
    }

    const auto = window.setInterval(() => {
      if (!el) return
      const step = getStep()
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: step, behavior: "smooth" })
      }
    }, 1500)

    const onResize = () => {
      // Recalculate step implicitly by reading sizes on next tick
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearInterval(auto)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const menuItems = getMenuItems(handleLogout)

  const rehearsalOptions = [
    {
      id: 'vocal-warmups',
      title: 'Vocal Warm-ups',
      description: 'Practice vocal exercises and breathing techniques',
      icon: Music,
      href: '#',
      gradient: 'from-purple-600 via-indigo-600 to-blue-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'pre-rehearsals',
      title: 'Pre-Rehearsals',
      description: 'Prepare for upcoming rehearsal sessions',
      icon: Calendar,
      href: '#',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'ongoing-rehearsals',
      title: 'Ongoing Rehearsals',
      description: 'Join active rehearsal sessions',
      icon: Users,
      href: '/pages/praise-night',
      gradient: 'from-emerald-600 via-green-600 to-lime-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'rehearsal-reviews',
      title: 'Rehearsal Reviews and Assessments',
      description: 'Review performance and get feedback',
      icon: Clock,
      href: '#',
      gradient: 'from-amber-600 via-orange-600 to-red-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      id: 'archives',
      title: 'Archives',
      description: 'Access past rehearsal recordings and materials',
      icon: MapPin,
      href: '#',
      gradient: 'from-rose-600 via-pink-600 to-purple-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600'
    },
    {
      id: 'karaoke',
      title: 'Karaoke',
      description: 'Practice songs with instrumental tracks',
      icon: Bell,
      href: '#',
      gradient: 'from-slate-600 via-gray-600 to-zinc-600',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <ScreenHeader 
        title="Rehearsals" 
        onMenuClick={toggleMenu} 
        rightImageSrc="/logo.png"
        onTitleClick={handleTitleClick}
      />

      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
        {/* Image Carousel */}
        <div className="mb-6">
          <div
            ref={scrollerRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-1"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
          >
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                data-card
                className="relative flex-shrink-0 w-56 sm:w-64 h-32 sm:h-36 overflow-hidden rounded-2xl shadow-xl bg-slate-200 snap-start"
              >
                <Image
                  src={src}
                  alt="Rehearsal moment"
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-cover object-center"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Rehearsal Options */}
        <div>
          {rehearsalOptions.map((option) => (
            <Link key={option.id} href={option.href}>
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group ring-1 ring-black/5 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${option.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                      <option.icon className={`w-4 h-4 ${option.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 text-sm group-hover:text-black leading-tight">
                        {option.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems} />
    </div>
  )
}
