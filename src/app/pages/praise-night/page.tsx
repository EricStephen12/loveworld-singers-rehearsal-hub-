"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

import { ChevronRight, ChevronLeft, Search, Clock, Music, User, BookOpen, Timer, Mic, Edit, ChevronDown, ChevronUp, Play, Pause, Menu, X, Bell, Users, Calendar, BarChart3, HelpCircle, Home, Plus, Filter, MoreHorizontal, Heart, Sparkles, CheckCircle, Globe, Info, ArrowLeft, SkipForward, SkipBack, MousePointer2, Hand, MousePointerClick, Piano, Drum, Guitar, HandMetal, Volume2 } from "lucide-react";
import SongDetailModal from "@/components/SongDetailModal";
import Link from "next/link";
import { getCurrentPraiseNight, getAllPraiseNights, setCurrentPraiseNight, getCurrentSongs, PraiseNightSong, PraiseNight } from "@/data/praise-night-songs";
import { offlineManager } from "@/utils/offlineManager";
import ScreenHeader from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import { getMenuItems } from "@/config/menuItems";
import { useAudio } from "@/contexts/AudioContext";

export default function PraiseNightPage() {
  const [currentPraiseNight, setCurrentPraiseNightState] = useState(getCurrentPraiseNight());
  const [allPraiseNights] = useState(getAllPraiseNights());
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Audio context
  const { setCurrentSong } = useAudio();
  
  // Add missing state variables that are used but not defined
  const [activeTab, setActiveTab] = useState('lyrics');

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
    switch (currentPraiseNight.id) {
      case 16:
        return "/Ecards/1000876785.png";
      case 17:
        return "/Ecards/1000876785.png"; // TODO: replace with PN17 e-card when available
      default:
        return "/Ecards/1000876785.png";
    }
  }, [currentPraiseNight.id]);

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
  }, [currentPraiseNight.id])

  // Handle category selection and close drawer
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsCategoryDrawerOpen(false);
  };

  // Handle song card click
  const handleSongClick = (song: any, index: number) => {
    setSelectedSongIndex(index); // Set the selected song index
    setSelectedSong({...song, imageIndex: index});
    setIsSongDetailOpen(true);
    setCurrentSong(song); // Set the current song in global audio context
    
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

  // Song categories
  const songCategories = [
    "New Praise Songs",
    "New Healing Songs", 
    "Previously Ministered Songs",
    "Approved Songs",
    "Previously Ministered Healing Songs",
    "LoveWorld Orchestra",
    "Praise in Languages"
  ];

  // Categories to show in horizontal bar (first 2)
  const mainCategories = songCategories.slice(0, 2);
  // Categories to keep in FAB (remaining ones)
  const otherCategories = songCategories.slice(2);

  // Icon mapping for categories
  const categoryIcons = {
    "New Praise Songs": Music,
    "New Healing Songs": Heart,
    "Approved Songs": CheckCircle,
    "Previously Ministered Songs": BookOpen,
    "Previously Ministered Healing Songs": Sparkles,
    "LoveWorld Orchestra": Users,
    "Praise in Languages": Globe
  };

  // Get centralized song data from the current praise night (client-side only)
  const [centralizedSongs, setCentralizedSongs] = useState<PraiseNightSong[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Load data with offline support
    const loadSongs = async () => {
      try {
        // Force refresh by getting fresh data directly from centralized source
        const freshSongs = getCurrentSongs();
        setCentralizedSongs(freshSongs);
        
        // Update cache with fresh data
        await offlineManager.cacheData('praise-night-songs', freshSongs);
        
        setIsDataLoaded(true);
        console.log('Songs loaded with fresh data from centralized source');
      } catch (error) {
        console.error('Failed to load songs:', error);
        // Fallback to direct function call
        const fallbackSongs = getCurrentSongs();
        setCentralizedSongs(fallbackSongs);
        setIsDataLoaded(true);
      }
    };

    loadSongs();
  }, [currentPraiseNight]);
  
  // Data already matches UI format, no transformation needed
  const songData = centralizedSongs;

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
    },
    // ... other fallback songs would go here
  ];

  // Use centralized data if available, otherwise show empty state
  const finalSongData = (isDataLoaded && songData.length > 0) ? songData : [];

  // Update data when praise night changes
  useEffect(() => {
    // This will trigger a re-render when currentPraiseNight changes
    // The getCurrentSongs() call will get the new data
  }, [currentPraiseNight]);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'heard' | 'unheard'>('heard');
  const [activeCategory, setActiveCategory] = useState<string>(songCategories[0]); // Default to first category
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  
  // Song detail modal states
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter songs based on selected category and status
  const filteredSongs = finalSongData.filter(song => 
    song.category === activeCategory && song.status === activeFilter
  );

  // Get counts for current category
  const categoryHeardCount = finalSongData.filter(song => song.category === activeCategory && song.status === 'heard').length;
  const categoryUnheardCount = finalSongData.filter(song => song.category === activeCategory && song.status === 'unheard').length;
  const categoryTotalCount = categoryHeardCount + categoryUnheardCount;

  const switchPraiseNight = (praiseNight: PraiseNight) => {
    setCurrentPraiseNight(praiseNight.id);
    setCurrentPraiseNightState(praiseNight);
    setShowDropdown(false);
  };

  // Search input focus from header search button
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  
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
  };

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
      <ScreenHeader 
        title={currentPraiseNight.name} 
        onMenuClick={toggleMenu} 
        rightImageSrc="/logo.png"
        timer={
          <div className="flex items-center gap-0.5 text-xs">
            <span className="font-bold text-gray-700">{formatNumber(timeLeft.days)}d</span>
            <span className="text-gray-500 font-bold">:</span>
            <span className="font-bold text-gray-700">{formatNumber(timeLeft.hours)}h</span>
            <span className="text-gray-500 font-bold">:</span>
            <span className="font-bold text-gray-700">{formatNumber(timeLeft.minutes)}m</span>
            <span className="text-gray-500 font-bold">:</span>
            <span className="font-bold text-gray-700">{formatNumber(timeLeft.seconds)}s</span>
            </div>
        }
        leftButtons={
                            <button
              aria-label="Switch Praise Night"
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
        }
        rightButtons={
            <button
              aria-label="Search"
              onClick={onHeaderSearchClick}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <Search className="w-5 h-5" />
            </button>
        }
      />

      {/* Header-level Praise Night Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={() => setShowDropdown(false)}
          />
          <div className="fixed right-3 left-3 sm:right-4 sm:left-auto top-16 sm:top-16 z-[70] w-auto sm:w-64 max-w-2xl mx-auto sm:mx-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
            {allPraiseNights.map((praiseNight) => (
              <button
                key={praiseNight.id}
                onClick={() => switchPraiseNight(praiseNight)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-slate-50 transition-colors ${
                  praiseNight.id === currentPraiseNight.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">{praiseNight.name}</div>
                <div className="text-xs sm:text-sm text-slate-600">{praiseNight.location} • {praiseNight.date}</div>
              </button>
            ))}
              </div>
        </>
      )}

      {/* Animated iOS-style Search Bar (slides from top) - Responsive */}
      <div className={`fixed left-0 right-0 top-0 z-40 transition-transform duration-300 ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
                ref={searchInputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
                placeholder="Search songs, writer, lead singer…"
                className="pl-10 h-10 text-sm border-0 ring-0 focus:ring-0 focus:border-0 bg-white/70 backdrop-blur rounded-xl shadow-sm"
              />
              <div className="absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </div>
            <button
              onClick={onCloseSearch}
              className="px-2 py-1 text-sm text-purple-600 font-medium active:scale-95"
            >
              Cancel
                            </button>
              </div>
              </div>
              </div>

      {/* Content Container with Responsive Max Width */}
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-2 sm:py-4 relative">
        {/* E-card with embedded switcher below (single image, no slide) */}
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

        {/* Pills under timer */}
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
          
        {/* Status Filter buttons/pills with category-specific count */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between px-4">
          <button 
            onClick={() => setActiveFilter('heard')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border ${
              activeFilter === 'heard' 
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border ${
              activeFilter === 'unheard' 
                ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            Unheard ({categoryUnheardCount})
          </button>
        </div>

        {/* Song Title Cards - Scrollable */}
        <div className="px-1 py-4 max-h-96 overflow-y-auto">
          {filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Music className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No songs available</p>
              <p className="text-sm">Songs will appear here when data is loaded</p>
            </div>
          ) : (
            filteredSongs.map((song, index) => (
              <div
                key={index}
                onClick={() => handleSongClick(song, index)}
                className={`bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group mb-3 w-full cursor-pointer ${
                  selectedSongIndex === index 
                    ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-200/50 bg-purple-50/30' 
                    : 'ring-1 ring-black/5'
                }`}
             >
               {/* Song Header - Rehearsal Style */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
                     <span className="text-sm font-semibold text-purple-600">
                       {index + 1}
                     </span>
                   </div>
                   <div className="flex-1">
                     <h3 className="font-medium text-slate-900 text-sm group-hover:text-black leading-tight">
                       {song.title}
          </h3>
                     <p className="text-xs text-slate-500 mt-0.5 leading-tight font-bold">
                        Singer: {song.leadSinger ? song.leadSinger.split(',')[0].trim() : 'Unknown'}
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
            ))
          )}
        </div>
        
        {/* Add bottom padding to prevent content from being hidden behind sticky categories */}
      </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems} />

      {/* Bottom Bar with Categories and FAB - Same Row */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-purple-100/60 via-purple-50/40 to-white/20 backdrop-blur-md shadow-sm">
        <div className="w-full flex items-center px-6 py-4 gap-4">
          {/* Category buttons with text */}
          {mainCategories.map((category, index) => (
            <div key={category} className="relative flex-1">
            <button
              onClick={() => handleCategorySelect(category)}
                className={`w-full px-3 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 text-center whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200/50'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              {category}
            </button>
            </div>
          ))}
          
          {/* FAB with Plus Icon and Tooltip */}
          <div className="relative flex-1 flex justify-center">
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
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeCategory === category
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
          onSongChange={(newSong) => {
            setSelectedSong(newSong);
            setCurrentSong(newSong);
          }}
        />
      )}

    </div>
  );
}