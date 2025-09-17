'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Settings, Calendar, Users, BarChart3, Download, Search, Menu, X, Home, User, Bell, HelpCircle, FileText, MessageCircle, Newspaper, Flag, Coffee, Play, Heart, Plus, MoreHorizontal, Shuffle, ChevronDown, ChevronUp, ArrowRight, Clock } from 'lucide-react'
import { getMenuItems } from '@/config/menuItems'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'

export default function HomePage() {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  
  // Use global search hook
  const { searchQuery, setSearchQuery, searchResults, hasResults } = useGlobalSearch()
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

  // Focus the input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // slight delay to allow element to mount before focusing
      const id = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [isSearchOpen])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('hasCompletedProfile')
    localStorage.removeItem('hasSubscribed')
    
    // Redirect to auth screen
    router.push('/auth')
  }

  const features = [
    {
      icon: Calendar,
      title: 'Rehearsals',
      href: '/pages/rehearsals',
      badge: null,
    },
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
      badge: true,
    },
    {
      icon: Users,
      title: 'Groups',
      href: '#',
      badge: null,
    },
    {
      icon: Music,
      title: 'Submit Song',
      href: '#',
      badge: null,
    },
    {
      icon: Play,
      title: 'Media',
      href: '#',
      badge: null,
    },
    {
      icon: Calendar,
      title: 'Ministy Calendar',
      href: '#',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Link',
      href: '#',
      badge: null,
    },
    {
      icon: HelpCircle,
      title: 'Admin Support',
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
      {/* Main Content Container with Responsive Max Width */}
      <div className="mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl">
        {/* Enhanced iOS Style Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div className="relative">
            {/* Normal Header Content */}
            <div className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ease-out ${
              isSearchOpen ? 'opacity-0' : 'opacity-100'
            }`}>
            {/* Left Section - Profile Picture */}
            <div className="flex items-center">
              {/* Enhanced Profile Picture with iOS-style border */}
              <Link href="#" className="w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-0 transition-all duration-200 hover:scale-105 active:scale-95">
                <div className="relative">
                  <img
                    src="/lmm.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* iOS-style subtle border */}
                  <div className="absolute inset-0 rounded-full border border-gray-200/50"></div>
                </div>
              </Link>
            </div>
            
            {/* Right Section with iOS-style spacing */}
            <div className="flex items-center space-x-1">
              {/* iOS-style Search Button */}
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                aria-label="Toggle search"
                className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <Search className="w-5 h-5 text-gray-600 transition-all duration-200" />
              </button>

              {/* Logo with subtle animation */}
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="LoveWorld Logo" 
                    className="w-10 h-10 object-contain transition-transform duration-200 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 w-10 h-10 bg-purple-500/10 rounded-full blur-sm -z-10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Search Overlay */}
          <div className={`absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${
            isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}>
            <div className="flex items-center justify-between px-4 py-3 h-full">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search songs, artists, events..."
                  inputMode="search"
                  aria-label="Search"
                  className="w-full text-lg bg-transparent px-0 py-3 text-gray-800 placeholder-gray-400 border-0 outline-none appearance-none shadow-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none font-poppins-medium"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                />
                
                {/* iOS-style search underline */}
                <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300/40" />
                
                {/* iOS-style active underline */}
                <div className="absolute left-0 bottom-0 h-0.5 bg-purple-500 w-full shadow-sm" 
                     style={{ boxShadow: '0 0 8px rgba(147, 51, 234, 0.4)' }} />
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }}
                aria-label="Close search"
                className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 ml-4"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <X className="w-6 h-6 text-gray-700 transition-all duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Overlay */}
        {isSearchOpen && hasResults && (
          <div className="absolute top-full left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-gray-100/50 max-h-96 overflow-y-auto">
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 mb-2 font-medium">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    onClick={() => setIsSearchOpen(false)}
                    className="block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {result.type === 'song' && <Music className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                          {result.type === 'page' && <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                          {result.type === 'category' && <Flag className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                            {result.title}
                          </h4>
                          {result.status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                              result.status === 'heard' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {result.status}
                            </span>
                          )}
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-purple-600 font-medium mb-0.5">
                            {result.subtitle}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {isSearchOpen && searchQuery.trim() && !hasResults && (
          <div className="absolute top-full left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-gray-100/50">
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for songs, artists, or events</p>
            </div>
          </div>
        )}
      </div>

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
        
        </div>
      </div>

        {/* Main Title */}
        <div className="text-center py-6">
          <h1 className="text-1xl font-bold text-gray-800">LoveWorld Singers Rehearsal Hub Portal</h1>
        </div>

        {/* Features Grid */}
        <div className="px-3 pb-4 lg:px-6">
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-4 xl:grid-cols-5 lg:gap-4">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group flex flex-col items-center p-2 lg:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 active:bg-gray-50 border border-gray-100/50 hover:border-purple-200/50"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="relative mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-sm">
                  <feature.icon className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                </div>
                {feature.badge && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 via-red-500 to-red-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold shadow-xl border-2 border-white animate-pulse">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>
              <span className="text-xs lg:text-sm font-medium text-gray-800 text-center leading-tight group-hover:text-purple-700 transition-colors duration-300">{feature.title}</span>
            </Link>
          ))}
        </div>
      </div>

        {/* About & FAQ Sections - Two Column Layout on Tablets */}
        <div className="px-4 pb-6 lg:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* About Section */}
            <div className="pb-6 lg:pb-0">
              <h2 className="text-lg lg:text-xl font-outfit-semibold text-gray-800 mb-4">ABOUT</h2>
              <div className="space-y-2 lg:space-y-3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => toggleAbout(0)}
                    className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
                  >
                    <h4 className="text-sm lg:text-base font-medium text-gray-800 pr-2">What is LoveWorld Singers Rehearsal Hub?</h4>
                    <div className="flex-shrink-0">
                      {openAbout === 0 ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />}
                    </div>
                  </button>
                  {openAbout === 0 && (
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5 border-t border-gray-100">
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed pt-3">A comprehensive platform for managing rehearsal schedules, song collections, and ministry activities. Connect with fellow singers, access audio resources, and stay updated with the latest ministry news.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-lg lg:text-xl font-outfit-semibold text-gray-800 mb-4">FAQ</h2>
              <div className="space-y-2 lg:space-y-3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => toggleFAQ(0)}
                    className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
                  >
                    <h4 className="text-sm lg:text-base font-medium text-gray-800 pr-2">How do I join a rehearsal?</h4>
                    <div className="flex-shrink-0">
                      {openFAQ === 0 ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />}
                    </div>
                  </button>
                  {openFAQ === 0 && (
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5 border-t border-gray-100">
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed pt-3">Check the Rehearsals section for upcoming sessions and register through the calendar.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => toggleFAQ(1)}
                    className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
                  >
                    <h4 className="text-sm lg:text-base font-medium text-gray-800 pr-2">Where can I find song lyrics?</h4>
                    <div className="flex-shrink-0">
                      {openFAQ === 1 ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />}
                    </div>
                  </button>
                  {openFAQ === 1 && (
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5 border-t border-gray-100">
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed pt-3">Access song lyrics and audio resources in the AudioLabs section.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => toggleFAQ(2)}
                    className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none"
                  >
                    <h4 className="text-sm lg:text-base font-medium text-gray-800 pr-2">How do I get support?</h4>
                    <div className="flex-shrink-0">
                      {openFAQ === 2 ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />}
                    </div>
                  </button>
                  {openFAQ === 2 && (
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5 border-t border-gray-100">
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed pt-3">Use the Support section or contact your ministry coordinator for assistance.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
