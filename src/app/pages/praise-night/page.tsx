"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

import { ChevronRight, ChevronLeft, Search, Clock, Music, User, BookOpen, Timer, Mic, Edit, ChevronDown, ChevronUp, Play, Pause, Menu, X, Bell, Users, Calendar, BarChart3, HelpCircle, Home, Plus, Filter, MoreHorizontal, Heart, Sparkles, CheckCircle, Globe, Info, ArrowLeft, SkipForward, SkipBack, MousePointer2, Hand, MousePointerClick, Piano, Drum, Guitar, HandMetal, Volume2, Flag } from "lucide-react";
import SongDetailModal from "@/components/SongDetailModal";
import Link from "next/link";
import { PraiseNightSong, PraiseNight } from "@/types/supabase";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { OfflineBanner } from "@/components/OfflineIndicator";
import ScreenHeader from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import { getMenuItems } from "@/config/menuItems";
import { useAudio } from "@/contexts/AudioContext";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

function PraiseNightPageContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  // Use real-time Supabase data for instant updates
  const { pages: allPraiseNights, loading, error, getCurrentPage, getCurrentSongs } = useRealtimeData();
  const [currentPraiseNight, setCurrentPraiseNightState] = useState<PraiseNight | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter praise nights by category if specified
  const filteredPraiseNights = useMemo(() => {
    if (loading || !allPraiseNights) return [];

    if (!categoryFilter) {
      // When no category filter, exclude unassigned pages from regular view
      return allPraiseNights.filter(praiseNight => praiseNight.category !== 'unassigned');
    }
    return allPraiseNights.filter(praiseNight => praiseNight.category === categoryFilter);
  }, [allPraiseNights, categoryFilter, loading]);

  // Auto-select first page only when no page is selected
  useEffect(() => {
    if (filteredPraiseNights.length > 0 && !currentPraiseNight) {
      // Only auto-select if no page is currently selected
      const firstPage = filteredPraiseNights[0];
      setCurrentPraiseNightState(firstPage);
    }
  }, [filteredPraiseNights, currentPraiseNight]);

  // Real-time data automatically loads songs, so we don't need the manual loading effect anymore

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Audio context
  const { setCurrentSong, play } = useAudio();

  // Add missing state variables that are used but not defined
  const [activeTab, setActiveTab] = useState('lyrics');

  // Song categories - get from Supabase data
  const songCategories = useMemo(() => {
    if (!currentPraiseNight?.songs) return [];
    const uniqueCategories = [...new Set(currentPraiseNight.songs.map(song => song.category))];
    return uniqueCategories;
  }, [currentPraiseNight?.songs]);

  // Categories to show in horizontal bar (first 2)
  const mainCategories = songCategories.slice(0, 2);
  // Categories to keep in FAB (remaining ones)
  const otherCategories = songCategories.slice(2);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'heard' | 'unheard'>('heard');
  const [activeCategory, setActiveCategory] = useState<string>(''); // Will be set when categories load
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  // Set active category when categories are loaded
  useEffect(() => {
    if (songCategories.length > 0 && !activeCategory) {
      setActiveCategory(songCategories[0]);
    }
  }, [songCategories, activeCategory]);

  // Song detail modal states
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Listen for global mini player events
  React.useEffect(() => {
    const handleOpenFullPlayer = (event: CustomEvent) => {
      const song = event.detail.song;
      if (song) {
        setSelectedSong(song);
        setIsSongDetailOpen(true);
        // Dispatch event to hide mini player
        window.dispatchEvent(new CustomEvent('songDetailOpen'));
      }
    };

    window.addEventListener('openFullPlayer', handleOpenFullPlayer as EventListener);

    return () => {
      window.removeEventListener('openFullPlayer', handleOpenFullPlayer as EventListener);
    };
  }, []);

  // Map selected Praise Night to its e-card image (fallback to a default)
  const ecardSrc = useMemo(() => {
    if (!currentPraiseNight) return "/Ecards/1000876785.png";

    switch (currentPraiseNight.id) {
      case 16:
        return "/Ecards/1000876785.png";
      case 17:
        return "/Ecards/1000876785.png"; // TODO: replace with PN17 e-card when available
      default:
        return "/Ecards/1000876785.png";
    }
  }, [currentPraiseNight]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('hasCompletedProfile')
    localStorage.removeItem('hasSubscribed')

    // Redirect to auth screen - using window.location for full page refresh
    window.location.href = '/auth'
  }

  const menuItems = getMenuItems(handleLogout)

  // iOS-style mini countdown timer - now using centralized data
  const [timeLeft, setTimeLeft] = useState({
    days: 11,
    hours: 7,
    minutes: 48,
    seconds: 0,
  })

  // Initialize countdown and make it count down
  useEffect(() => {
    if (!currentPraiseNight) return;

    // Get countdown from current praise night with fallback
    const initialCountdown = currentPraiseNight.countdown || {
      days: 11,
      hours: 7,
      minutes: 48,
      seconds: 0
    };
    let currentTime = { ...initialCountdown };

    setTimeLeft(currentTime);

    // Update countdown every second
    const timer = setInterval(() => {
      // Decrease seconds
      currentTime.seconds--;

      // Handle time rollover
      if (currentTime.seconds < 0) {
        currentTime.seconds = 59;
        currentTime.minutes--;

        if (currentTime.minutes < 0) {
          currentTime.minutes = 59;
          currentTime.hours--;

          if (currentTime.hours < 0) {
            currentTime.hours = 23;
            currentTime.days--;

            // Stop countdown when it reaches zero
            if (currentTime.days < 0) {
              currentTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
              clearInterval(timer);
            }
          }
        }
      }

      setTimeLeft({ ...currentTime });
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [currentPraiseNight])

  // Handle category selection and close drawer
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsCategoryDrawerOpen(false);
  };

  // Handle song card click - opens song detail modal
  const handleSongClick = (song: any, index: number) => {
    setSelectedSongIndex(index); // Set the selected song index
    setSelectedSong({ ...song, imageIndex: index });
    setIsSongDetailOpen(true);
    setCurrentSong(song, false); // Set the current song in global audio context WITHOUT auto-play

    // Dispatch event to hide mini player
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  // Handle song card click when outside modal - opens modal AND starts playing
  const handleSongSwitch = (song: any, index: number) => {
    setSelectedSongIndex(index); // Set the selected song index
    setSelectedSong({ ...song, imageIndex: index });
    setIsSongDetailOpen(true);

    // Set the current song with auto-play enabled (only if it has audio)
    if (song.audioFile && song.audioFile.trim() !== '') {
      setCurrentSong(song, true); // Enable auto-play
    } else {
      setCurrentSong(song, false); // No auto-play
    }

    // Dispatch event to hide mini player
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  // Get image for song based on index
  const getSongImage = (index: number) => {
    const images = [
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
    ];
    return images[index % images.length]; // Cycle through images if more songs than images
  };

  // Handle closing song detail
  const handleCloseSongDetail = () => {
    setIsSongDetailOpen(false);
    setSelectedSong(null);

    // Dispatch event to show mini player (if song is playing)
    window.dispatchEvent(new CustomEvent('songDetailClose'));
  };

  // Format single digit numbers with leading zero
  const formatNumber = (num: number) => {
    if (isNaN(num) || num === undefined || num === null) return '00';
    return num < 10 ? `0${num}` : num.toString();
  }

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    // Simple category to icon mapping
    const categoryIconMap: { [key: string]: any } = {
      'worship': Heart,
      'praise': Sparkles,
      'hymn': BookOpen,
      'contemporary': Music,
      'traditional': Piano,
      'gospel': HandMetal,
      'ballad': Volume2,
      'fast': SkipForward,
      'slow': Timer,
      'medium': Play,
      'default': Music
    };

    const normalizedCategory = categoryName.toLowerCase();
    return categoryIconMap[normalizedCategory] || Music; // Default icon
  };

  // Use songs directly from currentPraiseNight (Supabase data)
  const songData = currentPraiseNight?.songs || [];
  const isDataLoaded = !loading && currentPraiseNight !== null;

  // Fallback data if no centralized songs available
  const fallbackSongData = [
    // New Praise Songs
    {
      title: "Mighty God",
      status: "heard",
      category: "New Praise Songs",
      singer: "Sarah Johnson",
      lyrics: {
        verse1: "Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions they fail not\nAs Thou hast been Thou forever wilt be",
        chorus: "Great is Thy faithfulness\nGreat is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided",
        verse2: "Summer and winter, and springtime and harvest\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love",
        bridge: "Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside"
      },
      leadSinger: "Sarah Johnson",
      writtenBy: "Pastor Chris Oyakhilome",
      key: "G Major",
      tempo: "72 BPM",
      comments: "This song should be sung with deep reverence and heartfelt emotion. Allow the congregation to really feel the weight of God's amazing grace."
    }
  ];

  // Use centralized data if available, otherwise show empty state
  const finalSongData = (isDataLoaded && songData.length > 0) ? songData : [];

  // Update data when praise night changes
  useEffect(() => {
    // This will trigger a re-render when currentPraiseNight changes
    // The getCurrentSongs() call will get the new data
  }, [currentPraiseNight]);

  // Filter songs based on selected category and status
  const filteredSongs = finalSongData.filter(song =>
    song.category === activeCategory && song.status === activeFilter
  );

  // Get counts for current category
  const categoryHeardCount = finalSongData.filter(song => song.category === activeCategory && song.status === 'heard').length;
  const categoryUnheardCount = finalSongData.filter(song => song.category === activeCategory && song.status === 'unheard').length;
  const categoryTotalCount = categoryHeardCount + categoryUnheardCount;

  const switchPraiseNight = (praiseNight: PraiseNight) => {
    setCurrentPraiseNightState(praiseNight);
    setShowDropdown(false);
    // Real-time data automatically includes all songs, no need to load manually
  };

  // Search input focus from header search button
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Use global search hook
  const { searchQuery, setSearchQuery, searchResults, hasResults } = useGlobalSearch();

  const onHeaderSearchClick = () => {
    setIsSearchOpen(true);
    const el = searchInputRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus after scroll animation
      setTimeout(() => el.focus(), 300);
    }
  };

  const onCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery(''); // Clear search query when closing
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>

        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading data</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out 0.4s both;
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        
        .breathe-animation {
          animation: breathe 2s ease-in-out infinite;
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
          width: 200%;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 2px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {/* Shared Screen Header with Search Button and Timer */}
      {/* Enhanced Header with Integrated Search */}
      <div className="mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div className="relative">
            {/* Normal Header Content */}
            <div className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-0' : 'opacity-100'
              }`}>
              {/* Left Section - Menu and Left Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMenu}
                  className="flex items-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 active:scale-95"
                  aria-label="Open menu"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                {categoryFilter !== 'archive' && (
                  <button
                    aria-label="Switch Praise Night"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition border border-slate-200"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Center - Title and Timer */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <h1 className="text-base sm:text-lg font-outfit-semibold text-gray-800">
                  {categoryFilter === 'archive' ? 'Archives' : (currentPraiseNight?.name || '')}
                </h1>
                {categoryFilter !== 'archive' && (
                  <div className="flex items-center gap-0.5 text-xs mt-0.5">
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.days)}d</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.hours)}h</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.minutes)}m</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.seconds)}s</span>
                  </div>
                )}
              </div>

              {/* Right Section - Search Button and Logo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsSearchOpen((v) => !v)}
                  aria-label="Toggle search"
                  className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                >
                  <Search className="w-5 h-5 text-gray-600 transition-all duration-200" />
                </button>
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
                    <div className="absolute inset-0 w-10 h-10 bg-purple-500/10 rounded-full blur-sm -z-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Search Overlay */}
            <div className={`absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
              }`}>
              <div className="flex items-center justify-between px-4 py-3 h-full">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder="Search songs, writer, lead singer..."
                    inputMode="search"
                    aria-label="Search"
                    className="w-full text-lg bg-transparent px-0 py-3 text-gray-800 placeholder-gray-400 border-0 outline-none appearance-none shadow-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none font-poppins-medium"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  />
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300/40" />
                  <div className="absolute left-0 bottom-0 h-0.5 bg-purple-500 w-full shadow-sm"
                    style={{ boxShadow: '0 0 8px rgba(147, 51, 234, 0.4)' }} />
                </div>
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
        </div>

        {/* Search Results Overlay */}
        {isSearchOpen && (
          <div className="fixed left-0 right-0 top-16 z-[65] bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
            <div className="mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl px-4 py-2">
              <div className="text-xs text-gray-500 mb-2 font-medium">
                {searchQuery ? (
                  `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                ) : (
                  'Start typing to search songs, artists, or events...'
                )}
              </div>
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((result) => {
                    // Handle song results differently - open modal directly
                    if (result.type === 'song') {
                      return (
                        <button
                          key={result.id}
                          onClick={() => {
                            // Find the song in the current data and open modal
                            const song = finalSongData.find(s => s.title === result.title);
                            if (song) {
                              const songIndex = finalSongData.indexOf(song);
                              handleSongClick(song, songIndex);
                            }
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group"
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
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard'
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
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      );
                    } else {
                      // For page/category results, use navigation
                      return (
                        <Link
                          key={result.id}
                          href={result.url}
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchQuery('')
                          }}
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
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard'
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
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                          </div>
                        </Link>
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for songs, artists, or events</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header-level Praise Night Dropdown - Hide for archive */}
      {showDropdown && categoryFilter !== 'archive' && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[75]"
            onClick={() => setShowDropdown(false)}
          />
          <div className="fixed right-3 left-3 sm:right-4 sm:left-auto top-16 sm:top-16 z-[80] w-auto sm:w-64 max-w-2xl mx-auto sm:mx-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
            {filteredPraiseNights.length > 0 ? (
              filteredPraiseNights.map((praiseNight) => (
                <button
                  key={praiseNight.id}
                  onClick={() => switchPraiseNight(praiseNight)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-slate-50 transition-colors ${praiseNight.id === currentPraiseNight?.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''
                    }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{praiseNight.name}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{praiseNight.location} • {praiseNight.date}</div>
                </button>
              ))
            ) : (
              <div className="px-3 sm:px-4 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-slate-500 text-sm mb-2 font-medium">
                  {categoryFilter === 'pre-rehearsal' && 'No Pre-Rehearsal pages yet'}
                  {categoryFilter === 'ongoing' && 'No Ongoing pages yet'}
                  {categoryFilter === 'archive' && 'No Archived pages yet'}
                  {categoryFilter === 'unassigned' && 'No Unassigned pages yet'}
                  {!categoryFilter && 'No pages available'}
                </div>
                <div className="text-slate-400 text-xs">
                  {categoryFilter ? 'Pages will appear here when added to this category' : 'Create your first page to get started'}
                </div>
              </div>
            )}
          </div>
        </>
      )}



      {/* Content Container with Responsive Max Width */}
      <div className="mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl px-3 sm:px-4 lg:px-6 py-2 sm:py-4 relative">
        {/* Offline Banner */}
        <OfflineBanner />

        {/* Archive Cards Grid - Special layout for archive category */}
        {categoryFilter === 'archive' && (
          <div className="mb-6">
            {filteredPraiseNights.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredPraiseNights.map((praiseNight) => (
                  <button
                    key={praiseNight.id}
                    onClick={() => {
                      setCurrentPraiseNightState(praiseNight);
                      // Real-time data automatically includes all songs
                    }}
                    className={`group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${currentPraiseNight?.id === praiseNight.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                  >
                    {/* Banner Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                      {praiseNight.bannerImage ? (
                        <img
                          src={praiseNight.bannerImage}
                          alt={praiseNight.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">PN{praiseNight.id}</span>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* Page Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{praiseNight.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{praiseNight.date}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{praiseNight.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-slate-500 text-sm mb-2 font-medium">No Archived pages yet</div>
                <div className="text-slate-400 text-xs">Pages will appear here when added to this category</div>
              </div>
            )}
          </div>
        )}

        {/* E-card with embedded switcher below (single image, no slide) - Hide for archive */}
        {categoryFilter !== 'archive' && currentPraiseNight && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2 sm:mb-3 max-w-md sm:max-w-lg mx-auto shadow-2xl shadow-black/20 ring-1 ring-black/5 breathe-animation">
            <div className="relative h-35 sm:h-43 md:h-51">
              <Image
                src={ecardSrc}
                alt="Praise Night E-card"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                className="object-cover object-center"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        )}

        {/* Pills under timer - Hide for archive */}
        {categoryFilter !== 'archive' && currentPraiseNight && (
          <div className="mb-4 sm:mb-6">
            <div
              className="-mx-3 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.animationPlayState = 'paused';
                clearTimeout((target as any).scrollTimeout);
                (target as any).scrollTimeout = setTimeout(() => {
                  target.style.animationPlayState = 'running';
                }, 2000);
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 animate-scroll">
                {/* First set of pills */}
                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                    <Music className="w-3.5 h-3.5 text-purple-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Songs Schedule</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100">
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Audio Lab</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Conductor's Guide</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Sheet Music</span>
                </button>

                {/* Duplicate set for seamless scrolling */}
                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                    <Music className="w-3.5 h-3.5 text-purple-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Songs Schedule</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100">
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Audio Lab</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Conductor's Guide</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium">Sheet Music</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter buttons/pills with category-specific count - Hide for archive */}
        {categoryFilter !== 'archive' && currentPraiseNight && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between px-4">
            <button
              onClick={() => setActiveFilter('heard')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'heard'
                ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
            >
              Heard ({categoryHeardCount})
            </button>

            <div className="text-center">
              <span className="text-xs text-gray-600 font-black">
                {activeCategory}
              </span>
            </div>

            <button
              onClick={() => setActiveFilter('unheard')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'unheard'
                ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
            >
              Unheard ({categoryUnheardCount})
            </button>
          </div>
        )}

        {/* Song Title Cards - Scrollable - Hide for archive */}
        {categoryFilter !== 'archive' && currentPraiseNight && (
          <div className="px-1 py-4 max-h-96 lg:max-h-none overflow-y-auto">
            {filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-slate-500 text-sm mb-2 font-medium">
                  {!currentPraiseNight && 'No praise night selected'}
                  {currentPraiseNight && !activeCategory && 'No category selected'}
                  {currentPraiseNight && activeCategory && categoryTotalCount === 0 && `No songs in ${activeCategory} category yet`}
                  {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && `No heard songs in ${activeCategory} yet`}
                  {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && `No unheard songs in ${activeCategory} yet`}
                </div>
                <div className="text-slate-400 text-xs">
                  {!currentPraiseNight && 'Select a praise night from the dropdown above'}
                  {currentPraiseNight && !activeCategory && 'Select a category from the bottom navigation'}
                  {currentPraiseNight && activeCategory && categoryTotalCount === 0 && 'Songs will appear here when added to this category'}
                  {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && 'Songs will appear here when marked as heard'}
                  {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && 'Songs will appear here when marked as unheard'}
                </div>
              </div>
            ) : (
              <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
                {filteredSongs.map((song, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      // Open modal without auto-play
                      handleSongClick(song, index);
                    }}
                    className={`bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-3 lg:p-4 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group mb-3 lg:mb-0 w-full cursor-pointer ${selectedSongIndex === index
                      ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-200/50 bg-purple-50/30'
                      : 'ring-1 ring-black/5'
                      }`}
                  >
                    {/* Song Header - Rehearsal Style */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
                          <span className="text-sm lg:text-base font-semibold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 text-sm lg:text-base group-hover:text-black leading-tight">
                            {song.title}
                          </h3>
                          <p className="text-xs lg:text-sm text-slate-500 mt-0.5 leading-tight font-bold">
                            Singer: {song.leadSinger ? song.leadSinger.split(',')[0].trim() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Rehearsal Count */}
                        <div className="px-2 py-1 bg-purple-100 rounded-full">
                          <span className="text-xs font-bold text-purple-600">
                            x{(song.history?.filter(entry => entry.type === 'metadata').length || 0) + 1}
                          </span>
                        </div>
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add bottom padding to prevent content from being hidden behind sticky categories */}
      </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems} />

      {/* Bottom Bar with Categories and FAB - Same Row - Hide when no pages in category */}
      {filteredPraiseNights.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-purple-100/60 via-purple-50/40 to-white/20 backdrop-blur-md shadow-sm">
          <div className="w-full flex items-center px-4 sm:px-6 py-4 gap-2 sm:gap-4">
            {/* Category buttons with text */}
            {mainCategories.map((category, index) => (
              <div key={category} className="relative flex-1">
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-2 sm:px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center whitespace-nowrap ${activeCategory === category
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200/50'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                    }`}
                >
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">
                    {category === 'Pre-rehearsal' ? 'Pre' :
                      category === 'Ongoing' ? 'Live' :
                        category === 'Archive' ? 'Past' : category}
                  </span>
                </button>
              </div>
            ))}

            {/* FAB with Plus Icon and Tooltip */}
            <div className="relative flex-1 flex flex-col items-center min-w-0">
              {/* Other Categories indicator above FAB */}
              <div className="text-xs text-purple-400 font-medium mb-1 text-center whitespace-nowrap px-1">
                <span className="hidden sm:inline">Other Categories</span>
                <span className="sm:hidden">More</span>
              </div>
              <button
                onClick={() => setIsCategoryDrawerOpen(true)}
                onMouseEnter={() => setHoveredCategory("Other Categories")}
                onMouseLeave={() => setHoveredCategory(null)}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center active:scale-95"
              >
                <Image
                  src="/click-icon.png"
                  alt="Click for more categories"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>

              {/* iOS-style Tooltip for FAB */}
              {hoveredCategory === "Other Categories" && (
                <div className="fixed bottom-20 z-[60] pointer-events-none" style={{
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  <div className="bg-black/90 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl whitespace-nowrap shadow-2xl border border-white/20 max-w-[280px]">
                    Other Categories
                    {/* iOS-style arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-black/90"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Drawer */}
      {isCategoryDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsCategoryDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 animate-in slide-in-from-bottom">
            <div className="px-6 py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
                <button
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Total Songs Count */}
              <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">{finalSongData.length} Total Scheduled Songs</p>
              </div>

              {/* Category Options */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {otherCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === category
                      ? 'bg-purple-100 border-2 border-purple-300 text-purple-800'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                      }`}
                  >
                    <div className="font-medium text-slate-900 text-sm leading-tight">{category}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                      {finalSongData.filter(song => song.category === category).length} songs
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Song Detail Modal */}
      {isSongDetailOpen && selectedSong && (
        <SongDetailModal
          selectedSong={selectedSong}
          isOpen={isSongDetailOpen}
          onClose={handleCloseSongDetail}
          currentFilter={activeFilter}
          songs={songData}
          onSongChange={(newSong) => {
            setSelectedSong(newSong);
            // Don't auto-play here since the modal handles it
          }}
        />
      )}
    </div>
  );
}

export default function PraiseNightPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>

        </div>
      </div>
    }>
      <PraiseNightPageContent />
    </Suspense>
  );
}