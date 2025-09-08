'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Settings, Calendar, Users, BarChart3, Download, Search, Menu, X, Home, User, Bell, HelpCircle, FileText, MessageCircle, Newspaper, Flag, Coffee, Play, Heart, Plus, MoreHorizontal, Shuffle, ChevronDown, ChevronUp } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [openAbout, setOpenAbout] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Carousel images array
  const carouselImages = [
    '/images/home.jpg',
    '/images/DSC_6155_scaled.jpg',
    '/images/DSC_6303_scaled.jpg',
    '/images/DSC_6446_scaled.jpg',
    '/images/DSC_6506_scaled.jpg',
    '/images/DSC_6516_scaled.jpg',
    '/images/DSC_6636_1_scaled.jpg',
    '/images/DSC_6638_scaled.jpg',
    '/images/DSC_6644_scaled.jpg',
    '/images/DSC_6658_1_scaled.jpg',
    '/images/DSC_6676_scaled.jpg'
  ]

  // Auto-slide carousel every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [carouselImages.length])

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      const hasCompletedProfile = localStorage.getItem('hasCompletedProfile')
      const hasSubscribed = localStorage.getItem('hasSubscribed')
      
      if (authStatus === 'true' && hasCompletedProfile === 'true' && hasSubscribed === 'true') {
        setIsAuthenticated(true)
      } else {
        // Redirect to appropriate step
        if (authStatus !== 'true') {
          router.push('/auth')
        } else if (hasCompletedProfile !== 'true') {
          router.push('/profile-completion')
        } else if (hasSubscribed !== 'true') {
          router.push('/subscription')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const toggleAbout = (index: number) => {
    setOpenAbout(openAbout === index ? null : index)
  }

  const features = [
    {
      icon: User,
      title: 'Profile',
      href: '/pages/profile',
      badge: null,
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      href: '#',
      badge: 164,
    },
    {
      icon: Users,
      title: 'Groups',
      href: '#',
      badge: 2,
    },
    {
      icon: Music,
      title: 'AudioLabs',
      href: '#',
      badge: 5,
    },
    {
      icon: Calendar,
      title: 'Rehearsals',
      href: '#',
      badge: null,
    },
    {
      icon: Play,
      title: 'Media',
      href: '#',
      badge: 3,
    },
    {
      icon: Calendar,
      title: 'Ministy Calendar',
      href: '#',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Our Marketplace',
      href: '#',
      badge: null,
    },
    {
      icon: HelpCircle,
      title: 'Support',
      href: '#',
      badge: null,
    },
  ]

  const recentItems = [
    {
      icon: Flag,
      title: "Comparative Sale Values - Waterfall Country and Village Estate",
      date: "6 Jul 2018"
    },
    {
      icon: Newspaper,
      title: "New Community Guidelines Update",
      date: "4 Jul 2018"
    },
    {
      icon: MessageCircle,
      title: "Monthly Residents Meeting Minutes",
      date: "2 Jul 2018"
    }
  ]

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen">

      {/* Hero Banner - Carousel */}
      <div className="px-4 py-6">
        <div className="relative h-[30vh] rounded-3xl overflow-hidden shadow-lg">
          {/* Carousel Images */}
          <div className="relative w-full h-full">
            {carouselImages.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`LoveWorld Singers Rehearsal Hub ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          {/* Logo at Top Center */}
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <img 
              src="/logo.png" 
              alt="LoveWorld Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center py-6">
        <h1 className="text-1xl font-bold text-gray-800">LoveWorld Singers Rehearsal Hub Portal</h1>
      </div>

      {/* Features Grid */}
      <div className="px-3 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 active:bg-gray-50"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="relative mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-purple-600" />
                </div>
                {feature.badge && (
                  <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold text-[9px] shadow-sm">
                    {feature.badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-800 text-center leading-tight">{feature.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ABOUT</h2>
        <div className="space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => toggleAbout(0)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
            >
              <h4 className="text-sm font-medium text-gray-800 pr-2">What is LoveWorld Singers Rehearsal Hub?</h4>
              <div className="flex-shrink-0">
                {openAbout === 0 ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>
            {openAbout === 0 && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">A comprehensive platform for managing rehearsal schedules, song collections, and ministry activities. Connect with fellow singers, access audio resources, and stay updated with the latest ministry news.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">FAQ</h2>
        <div className="space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => toggleFAQ(0)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
            >
              <h4 className="text-sm font-medium text-gray-800 pr-2">How do I join a rehearsal?</h4>
              <div className="flex-shrink-0">
                {openFAQ === 0 ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>
            {openFAQ === 0 && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">Check the Rehearsals section for upcoming sessions and register through the calendar.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => toggleFAQ(1)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
            >
              <h4 className="text-sm font-medium text-gray-800 pr-2">Where can I find song lyrics?</h4>
              <div className="flex-shrink-0">
                {openFAQ === 1 ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>
            {openFAQ === 1 && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">Access song lyrics and audio resources in the AudioLabs section.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => toggleFAQ(2)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
            >
              <h4 className="text-sm font-medium text-gray-800 pr-2">How do I get support?</h4>
              <div className="flex-shrink-0">
                {openFAQ === 2 ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>
            {openFAQ === 2 && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">Use the Support section or contact your ministry coordinator for assistance.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sliding Drawer */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={toggleDrawer}
        />
        
        {/* Drawer Content */}
        <div className="relative w-80 max-w-sm h-full bg-white shadow-xl border-r border-gray-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button 
              onClick={toggleDrawer}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          
        </div>
      </div>
    </div>
  )
}
