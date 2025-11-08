'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Settings, Calendar, Users, BarChart3, Download, Search, Menu, X, Home, User, Bell, HelpCircle, FileText, MessageCircle, Newspaper, Flag, Coffee, Play, Heart, Plus, MoreHorizontal, Shuffle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { getMenuItems } from '@/config/menuItems'
import SharedDrawer from '@/components/SharedDrawer'
import { useHomeGlobalSearch, HomeSearchResult } from '@/hooks/useHomeGlobalSearch'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import { handleAppRefresh } from '@/utils/refresh-utils'

function HomePageContent() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)  
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [openAbout, setOpenAbout] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Use global search hook for comprehensive search
  const { searchQuery: globalSearchQuery, setSearchQuery: setGlobalSearchQuery, searchResults, hasResults } = useHomeGlobalSearch()
  const typedSearchResults = searchResults as HomeSearchResult[]

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

  // ✅ Preload first carousel image for instant display
  useEffect(() => {
    const img = new Image();
    img.src = carouselImages[0];
  }, []);

  // Auto-slide carousel every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [carouselImages.length])



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

  const handleLogout = async () => {
    try {
      await signOut()
      // Don't use router.push - signOut already handles redirect
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleRefresh = handleAppRefresh;

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Search': Search,
      'Music': Music,
      'Calendar': Calendar,
      'User': User,
      'Bell': Bell,
      'Users': Users,
      'Play': Play,
      'BarChart3': BarChart3,
      'HelpCircle': HelpCircle,
      'Flag': Flag,
      'Info': Info,
      'Home': Home
    };
    return iconMap[iconName] || Search;
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
      href: '/pages/notifications',
      badge: true,
    },
    {
      icon: Users,
      title: 'Groups',
      href: '/pages/groups',
      badge: null,
    },
    {
      icon: Music,
      title: 'Submit Song',
      href: '/pages/submit-song',
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
      title: 'Ministry Calendar',
      href: '/pages/calendar',
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
      href: '/pages/support',
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

  return (
     <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-slate-50">
       {/* Responsive Container with Max Width */}
       <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      {/* Fixed Header - Full Width */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
        <div className="w-full">
          <div className="relative">
            {/* Normal Header Content */}
            <div className={`flex items-center justify-between px-3 sm:px-4 py-3 transition-all duration-300 ease-out ${
              isSearchOpen ? 'opacity-0' : 'opacity-100'
            }`}>
            {/* Left Section - Profile Picture */}
            <div className="flex items-center">
              {/* Enhanced Profile Picture with iOS-style border */}
              <Link href="#" className="w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-0 transition-all duration-200 hover:scale-105 active:scale-95">
                <div className="relative">
                  <img
                    src="/logo.png"
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
                    src="/lmm.png" 
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
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search songs, lyrics, solfas, pages..."
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
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 ml-4"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <X className="w-6 h-6 text-gray-700 transition-all duration-200" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Search Results Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-30 bg-white/95 backdrop-blur-xl pt-20 overflow-y-auto scrollbar-hide" style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 pb-8">
            <div className="text-sm text-gray-500 mb-4">
              {globalSearchQuery ? (
                `${typedSearchResults.length} result${typedSearchResults.length !== 1 ? 's' : ''} for "${globalSearchQuery}"`
              ) : (
                'Start typing to search everything...'
              )}
            </div>
            
            {typedSearchResults.length > 0 ? (
              <div className="space-y-3">
                {typedSearchResults.map((result) => {
                  const IconComponent = getIconComponent(result.icon || 'Search');
                  return (
                    <Link
                      key={result.id}
                      href={result.url}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setGlobalSearchQuery('');
                      }}
                      className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl border-0 hover:bg-white/90 transition-all duration-200 active:scale-[0.97] shadow-sm ring-1 ring-black/5"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                          {result.title}
                        </h4>
                        {result.subtitle && (
                          <p className="text-xs text-purple-600 font-medium mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : globalSearchQuery ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No results found</h3>
                <p className="text-sm text-gray-400">Try searching for songs, features, or events</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Search Everything</h3>
                <p className="text-sm text-gray-400">Find songs, events, features, and more</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide content-bottom-safe" style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
           {/* Hero Banner - Carousel */}
           <div className="py-6 pt-20">
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
           <div className="pb-4">
             <div className="grid grid-cols-3 gap-2">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="group flex flex-col items-center p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.97] border-0 hover:bg-white/90 ring-1 ring-black/5"
                >
                  <div className="relative mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-sm">
                      <feature.icon className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                    </div>
                    {feature.badge && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 via-red-500 to-red-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold shadow-xl border-2 border-white animate-pulse">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-800 text-center leading-tight group-hover:text-purple-700 transition-colors duration-300">{feature.title}</span>
                </Link>
              ))}
            </div>
          </div>

           {/* About Section */}
           <div className="pb-6">
            <h2 className="text-lg font-outfit-semibold text-gray-800 mb-4">ABOUT</h2>
            <div className="space-y-2">
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
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
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">A comprehensive platform for managing rehearsal schedules, song collections, and ministry activities. Connect with fellow singers, access audio resources, and stay updated with the latest rehearsal updates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

           {/* FAQ Section */}
           <div className="pb-6">
            <h2 className="text-lg font-outfit-semibold text-gray-800 mb-4">FAQ</h2>
            <div className="space-y-2">
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
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
              
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
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
              
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
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
        </div>
      </div>

      {/* Shared Drawer with Logout */}
      <SharedDrawer
        open={isDrawerOpen}
        onClose={toggleDrawer}
        title="Menu"
        items={getMenuItems(handleLogout, handleRefresh)}
      />
      </div> {/* End Desktop Container */}
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={false}>
      <HomePageContent />
    </AuthGuard>
  )
}