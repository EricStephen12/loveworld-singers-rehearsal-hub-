"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

import { ChevronRight, ChevronLeft, Search, Clock, Music, User, BookOpen, Timer, Mic, Edit, ChevronDown, ChevronUp, Play, Pause, Menu, X, Bell, Users, Calendar, BarChart3, HelpCircle, Home, Plus, Filter, MoreHorizontal, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { getCurrentPraiseNight, getAllPraiseNights, setCurrentPraiseNight, getCurrentSongs, PraiseNightSong, PraiseNight } from "@/data/praise-night-songs";
import ScreenHeader from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import { getMenuItems } from "@/config/menuItems";

export default function PraiseNightPage() {
  const [currentPraiseNight, setCurrentPraiseNightState] = useState(getCurrentPraiseNight());
  const [allPraiseNights] = useState(getAllPraiseNights());
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

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
    setActiveTab('lyrics'); // Reset to lyrics tab
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
    setIsPlaying(false);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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
    "Previously Ministered Healing Songs",
    "LoveWorld Orchestra",
    "Praise in Languages",
    "Approved Songs"
  ];

  // Categories to show in horizontal bar (first 2)
  const mainCategories = songCategories.slice(0, 2);
  // Categories to keep in FAB (remaining ones)
  const otherCategories = songCategories.slice(2);

  // Get centralized song data from the current praise night (client-side only)
  const [centralizedSongs, setCentralizedSongs] = useState<PraiseNightSong[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  useEffect(() => {
    // Only load data on client side to avoid hydration mismatch
    const songs = getCurrentSongs();
    setCentralizedSongs(songs);
    setIsDataLoaded(true);
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
    { 
      title: "Victory Chant", 
      status: "heard", 
      category: "New Praise Songs",
      singer: "Michael David",
      lyrics: {
        verse1: "We have the victory in Jesus\nWe have the victory in Jesus\nWe have the victory in Jesus\nHallelujah, we have the victory",
        chorus: "Victory, victory, victory in Jesus\nVictory, victory, victory in Jesus\nVictory, victory, victory in Jesus\nHallelujah, we have the victory",
        verse2: "We have the power in Jesus\nWe have the power in Jesus\nWe have the power in Jesus\nHallelujah, we have the power",
        bridge: "Greater is He that is in us\nThan he that is in the world\nGreater is He that is in us\nThan he that is in the world"
      },
      leadSinger: "Michael David",
      writtenBy: "Pastor Chris Oyakhilome",
      key: "C Major",
      tempo: "120 BPM",
      comments: "An energetic song perfect for celebration and victory moments in worship."
    },
    { 
      title: "Celebrate Jesus", 
      status: "unheard", 
      category: "New Praise Songs",
      singer: "Grace Williams",
      lyrics: {
        verse1: "Celebrate Jesus, celebrate\nCelebrate Jesus, celebrate\nHe is risen from the dead\nAnd He's Lord of everything",
        chorus: "Celebrate Jesus, celebrate\nCelebrate Jesus, celebrate\nHe is risen from the dead\nAnd He's Lord of everything",
        verse2: "Celebrate His love for us\nCelebrate His love for us\nHe has given us new life\nAnd He's Lord of everything",
        bridge: "Hallelujah, hallelujah\nHallelujah, hallelujah\nHe is risen from the dead\nAnd He's Lord of everything"
      },
      leadSinger: "Grace Williams",
      writtenBy: "Pastor Chris Oyakhilome",
      key: "D Major",
      tempo: "140 BPM",
      comments: "A joyful celebration song perfect for Easter and resurrection themes."
    },
    { 
      title: "Shout to the Lord", 
      status: "heard", 
      category: "New Praise Songs",
      singer: "David Praise",
      lyrics: {
        verse1: "My Jesus, my Savior\nLord, there is none like You\nAll of my days I want to praise\nThe wonders of Your mighty love",
        chorus: "Shout to the Lord, all the earth, let us sing\nPower and majesty, praise to the King\nMountains bow down and the seas will roar\nAt the sound of Your name",
        verse2: "I sing for joy at the work of Your hands\nForever I'll love You, forever I'll stand\nNothing compares to the promise I have in You",
        bridge: "My comfort, my shelter\nTower of refuge and strength\nLet every breath, all that I am\nNever cease to worship You"
      },
      leadSinger: "David Praise",
      writtenBy: "Pastor Chris Oyakhilome",
      key: "F Major",
      tempo: "76 BPM",
      comments: "A powerful worship anthem that builds from quiet reflection to triumphant praise."
    },
    { title: "Amazing Love", status: "unheard", category: "New Praise Songs", singer: "Sarah Johnson" },
    { title: "Blessed Be Your Name", status: "heard", category: "New Praise Songs", singer: "Michael David" },
    { title: "Here I Am to Worship", status: "heard", category: "New Praise Songs", singer: "Grace Williams" },
    { title: "10,000 Reasons", status: "unheard", category: "New Praise Songs", singer: "David Praise" },
    { title: "What a Beautiful Name", status: "heard", category: "New Praise Songs", singer: "Sarah Johnson" },
    { title: "Good Good Father", status: "unheard", category: "New Praise Songs" },
    { title: "Reckless Love", status: "heard", category: "New Praise Songs" },
    { title: "Great Are You Lord", status: "unheard", category: "New Praise Songs" },
    { title: "Build My Life", status: "heard", category: "New Praise Songs" },
    { title: "King of Kings", status: "unheard", category: "New Praise Songs" },
    { title: "Way Maker", status: "heard", category: "New Praise Songs" },
    { title: "Lion and the Lamb", status: "unheard", category: "New Praise Songs" },
    { title: "Who You Say I Am", status: "heard", category: "New Praise Songs" },
    { title: "Living Hope", status: "unheard", category: "New Praise Songs" },
    { title: "Raise a Hallelujah", status: "heard", category: "New Praise Songs" },
    { title: "Goodness of God", status: "unheard", category: "New Praise Songs" },
    
    // New Healing Songs
    { title: "Healer of My Soul", status: "heard", category: "New Healing Songs" },
    { title: "By His Stripes", status: "unheard", category: "New Healing Songs" },
    { title: "Healing Power", status: "heard", category: "New Healing Songs" },
    { title: "Jesus the Healer", status: "unheard", category: "New Healing Songs" },
    { title: "Miracle Working God", status: "heard", category: "New Healing Songs" },
    { title: "Healing Waters", status: "unheard", category: "New Healing Songs" },
    { title: "Touch of the Master", status: "heard", category: "New Healing Songs" },
    { title: "Divine Restoration", status: "unheard", category: "New Healing Songs" },
    { title: "Wholeness in Jesus", status: "heard", category: "New Healing Songs" },
    { title: "God of Healing", status: "unheard", category: "New Healing Songs" },
    { title: "Miraculous Touch", status: "heard", category: "New Healing Songs" },
    { title: "Healing Light", status: "unheard", category: "New Healing Songs" },
    { title: "Restore and Renew", status: "heard", category: "New Healing Songs" },
    { title: "Perfect Healing", status: "unheard", category: "New Healing Songs" },
    { title: "Health and Strength", status: "heard", category: "New Healing Songs" },
    
    // Previously Ministered Songs
    { title: "Great Is Thy Faithfulness", status: "heard", category: "Previously Ministered Songs" },
    { title: "Holy, Holy, Holy", status: "heard", category: "Previously Ministered Songs" },
    { title: "How Great Thou Art", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Amazing Grace", status: "heard", category: "Previously Ministered Songs" },
    { title: "It Is Well", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Crown Him with Many Crowns", status: "heard", category: "Previously Ministered Songs" },
    { title: "The Old Rugged Cross", status: "unheard", category: "Previously Ministered Songs" },
    { title: "When I Survey the Wondrous Cross", status: "heard", category: "Previously Ministered Songs" },
    { title: "Nothing But the Blood", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Jesus Paid It All", status: "heard", category: "Previously Ministered Songs" },
    { title: "Because He Lives", status: "unheard", category: "Previously Ministered Songs" },
    { title: "He Lives", status: "heard", category: "Previously Ministered Songs" },
    { title: "Christ the Lord Is Risen Today", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Up from the Grave He Arose", status: "heard", category: "Previously Ministered Songs" },
    { title: "I Know That My Redeemer Lives", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Blessed Assurance", status: "heard", category: "Previously Ministered Songs" },
    { title: "What a Friend We Have in Jesus", status: "unheard", category: "Previously Ministered Songs" },
    { title: "Sweet Hour of Prayer", status: "heard", category: "Previously Ministered Songs" },
    
    // Previously Ministered Healing Songs
    { title: "Healing Rain", status: "heard", category: "Previously Ministered Healing Songs" },
    { title: "Touch of Heaven", status: "unheard", category: "Previously Ministered Healing Songs" },
    { title: "Restore My Soul", status: "heard", category: "Previously Ministered Healing Songs" },
    { title: "God of Miracles", status: "unheard", category: "Previously Ministered Healing Songs" },
    
    // LoveWorld Orchestra
    { title: "Symphony of Praise", status: "heard", category: "LoveWorld Orchestra" },
    { title: "Orchestral Worship", status: "unheard", category: "LoveWorld Orchestra" },
    { title: "Majestic Glory", status: "heard", category: "LoveWorld Orchestra" },
    { title: "Divine Symphony", status: "unheard", category: "LoveWorld Orchestra" },
    { title: "Heavenly Sounds", status: "heard", category: "LoveWorld Orchestra" },
    
    // Praise in Languages
    { title: "Santo Santo Santo", status: "heard", category: "Praise in Languages" },
    { title: "Hallelujah (French)", status: "unheard", category: "Praise in Languages" },
    { title: "Praise Him (Swahili)", status: "heard", category: "Praise in Languages" },
    { title: "Glory to God (Spanish)", status: "unheard", category: "Praise in Languages" },
    { title: "Worship Song (Chinese)", status: "heard", category: "Praise in Languages" },
    
    // Approved Songs
    { title: "Rock of Ages", status: "heard", category: "Approved Songs" },
    { title: "Be Thou My Vision", status: "unheard", category: "Approved Songs" },
    { title: "Come Thou Fount", status: "heard", category: "Approved Songs" },
    { title: "A Mighty Fortress", status: "unheard", category: "Approved Songs" },
    { title: "All Hail the Power", status: "heard", category: "Approved Songs" },
    { title: "When I Survey", status: "unheard", category: "Approved Songs" }
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
  const [activeTab, setActiveTab] = useState<'lyrics' | 'comments' | 'history'>('lyrics');
  const [activeHistorySubTab, setActiveHistorySubTab] = useState<'lyrics' | 'lead-singer' | 'written-by' | 'key' | 'comments' | 'audio'>('lyrics');
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isLeadSingerExpanded, setIsLeadSingerExpanded] = useState(false);
  const [isWrittenByExpanded, setIsWrittenByExpanded] = useState(false);
  const [isKeyExpanded, setIsKeyExpanded] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [isAudioExpanded, setIsAudioExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [isLyricsFullscreen, setIsLyricsFullscreen] = useState(false);

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

  function Header() {
    // Calculate total rehearsal progress
    const totalSongs = finalSongData.length;
    const heardSongs = finalSongData.filter(s => s.status === "heard").length;
    const unheardSongs = finalSongData.filter(s => s.status === "unheard").length;
    
    return (
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Praise Night Selector */}
              <div className="relative w-full sm:w-auto z-50">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
                >
                  <span className="text-sm font-medium">Switch Praise Night</span>
              <ChevronDown className="w-4 h-4 text-white/90" />
                </button>
                {showDropdown && (
                  <>
                    {/* Mobile backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/20 z-[60] sm:hidden"
                      onClick={() => setShowDropdown(false)}
                    />
                    {/* Dropdown */}
                <div className="fixed left-3 right-3 top-28 sm:absolute sm:top-full sm:left-0 sm:right-0 sm:left-auto mt-2 w-auto sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-[70] overflow-hidden max-h-64 overflow-y-auto">
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
          </div>
        </div>
      </div>
    );
  }

function RehearsalBadge({ count, extra }: { count: number; extra: number }) {
  const total = (count || 0) + (extra || 0);
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
          <Clock size={8} className="sm:w-3 sm:h-3"/>
          {count ?? 0}×
        </div>
        {extra ? (
          <div className="bg-purple-50 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
            +{extra}
          </div>
        ) : null}
        <span className="text-xs text-slate-500 hidden sm:inline">{total} total</span>
      </div>
      
      {/* Visual Rehearsal Progress with Tick Marks - Simplified for mobile */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: Math.min(count || 0, 4) }, (_, i) => (
          <span key={i} className="text-green-600 text-xs sm:text-sm">✅</span>
        ))}
        {Array.from({ length: Math.max(0, 4 - (count || 0)) }, (_, i) => (
          <span key={i} className="text-gray-300 text-xs sm:text-sm">⬜</span>
        ))}
        {extra > 0 && (
          <span className="text-blue-600 text-xs sm:text-sm ml-1">+{extra}</span>
        )}
      </div>
    </div>
  );
}

function RemarksTable({ remarks }: { remarks: Array<{date: string; text: string}> }) {
  if (!remarks?.length) {
    return (
      <div className="text-center py-6 sm:py-8 text-slate-500">
        <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs sm:text-sm">No pastor remarks yet</p>
      </div>
    );
  }
  return (
    <div className="space-y-2 sm:space-y-3">
      {remarks.map((r: {date: string; text: string}, i: number) => (
        <div key={i} className="border-l-4 border-l-purple-400 bg-purple-50 p-3 sm:p-4 rounded-r-lg">
          <div className="text-xs font-medium text-purple-700 mb-1">{r.date}</div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{r.text}</p>
        </div>
      ))}
    </div>
  );
}

function AudioLinks({ phases }: { phases: Array<{name: string; fullMix?: string; soprano?: string; tenor?: string; alto?: string; instrumentation?: string}> }) {
  const [nowPlaying, setNowPlaying] = useState<{
    url: string | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    progress: number;
  }>({ 
    url: null, 
    isPlaying: false, 
    currentTime: 0, 
    duration: 0,
    progress: 0 
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<number | null>(null);

  const updateProgress = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      const progress = duration ? (currentTime / duration) * 100 : 0;
      setNowPlaying(prev => ({
        ...prev,
        currentTime,
        duration,
        progress
      }));
    }
  };

  const togglePlayPause = (url: string) => {
    if (!url) return;
    
    if (nowPlaying.url === url) {
      // Toggle play/pause for currently playing audio
      if (nowPlaying.isPlaying) {
        audioRef.current?.pause();
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      } else {
        audioRef.current?.play();
        if (!progressInterval.current) {
          progressInterval.current = window.setInterval(updateProgress, 200);
        }
      }
      setNowPlaying(prev => ({...prev, isPlaying: !prev.isPlaying}));
    } else {
      // Stop current audio and play new one
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
      
      // Create new audio element
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => {
        if (!progressInterval.current) {
          progressInterval.current = window.setInterval(updateProgress, 200);
        }
        setNowPlaying(prev => ({
          ...prev,
          url,
          isPlaying: true,
          currentTime: 0,
          duration: audio.duration,
          progress: 0
        }));
      };
      
      audio.onpause = () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
        setNowPlaying(prev => prev.url === url ? {
          ...prev, 
          isPlaying: false 
        } : prev);
      };
      
      audio.onended = () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
        setNowPlaying({
          url: null, 
          isPlaying: false, 
          currentTime: 0, 
          duration: 0,
          progress: 0 
        });
      };
      
      audio.onloadedmetadata = () => {
        setNowPlaying(prev => ({
          ...prev,
          duration: audio.duration
        }));
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setNowPlaying({
          url: null, 
          isPlaying: false, 
          currentTime: 0, 
          duration: 0,
          progress: 0 
        });
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup audio and interval on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  if (!phases?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No audio links available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {phases.map((p: {name: string; fullMix?: string; soprano?: string; tenor?: string; alto?: string; instrumentation?: string}, i: number) => (
        <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {p.name}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[
              ["Full Mix", p.fullMix, "bg-green-100 text-green-800", "from-green-100 to-green-50"],
              ["Soprano", p.soprano, "bg-pink-100 text-pink-800", "from-pink-100 to-pink-50"],
              ["Tenor", p.tenor, "bg-blue-100 text-blue-800", "from-blue-100 to-blue-50"],
              ["Alto", p.alto, "bg-purple-100 text-purple-800", "from-purple-100 to-purple-50"],
              ["Instrumentation", p.instrumentation, "bg-orange-100 text-orange-800", "from-orange-100 to-orange-50"],
            ].map(([label, url, colorClass, gradientClass]) => (
              <div key={label} className={`p-3 rounded-lg ${colorClass} hover:shadow-sm transition-shadow`}>
                <div className="font-medium text-xs uppercase tracking-wide mb-2">{label}</div>
                {url ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePlayPause(url)}
                        className={`p-2 rounded-full ${nowPlaying.url === url && nowPlaying.isPlaying ? 'bg-white/90' : 'bg-white/70 hover:bg-white/90'} shadow-sm flex-shrink-0`}
                      >
                        {nowPlaying.url === url && nowPlaying.isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-700 truncate">
                          {label} Audio
                        </div>
                        {nowPlaying.url === url && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{formatTime(nowPlaying.currentTime)}</span>
                            <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                                style={{ width: `${nowPlaying.progress}%` }}
                              />
                            </div>
                            <span>{formatTime(nowPlaying.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs opacity-60">Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Lyrics({ lyrics }: { lyrics: {start: string; continue: string} }) {
  if (!lyrics?.start && !lyrics?.continue) {
    return (
      <div className="text-center py-6 sm:py-8 text-slate-500">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs sm:text-sm">No lyrics available</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm sm:text-base">Start</span>
        </div>
        <p className="text-sm sm:text-base md:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {lyrics.start || "No start lyrics available"}
        </p>
      </div>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
          <span className="text-sm sm:text-base">Continue</span>
        </div>
        <p className="text-sm sm:text-base md:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {lyrics.continue || "No continuation lyrics available"}
        </p>
      </div>
    </div>
  );
}



function TopCarousel() {
  const baseImages = useMemo(() => [
    "/Ecards/1000876785.png",
  ], []);
  const images = useMemo(() => (
    baseImages.length
      ? Array.from({ length: Math.max(8, baseImages.length) }, (_, i) => baseImages[i % baseImages.length])
      : []
  ), [baseImages]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const getStep = () => {
      const firstCard = el.querySelector<HTMLElement>("[data-card]");
      const gap = parseFloat(window.getComputedStyle(el).gap || "12");
      const width = firstCard?.offsetWidth || 260;
      return width + gap;
    };

    const auto = window.setInterval(() => {
      if (!el) return;
      const step = getStep();
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 2200);

    const onResize = () => {
      // Recalculate step implicitly by reading sizes on next tick
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearInterval(auto);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!images.length) return null;
  
  return (
    <div className="mb-4 sm:mb-6">
      <div
        ref={scrollerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory px-1 sm:px-0"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            data-card
            className="relative flex-shrink-0 w-36 sm:w-44 md:w-52 h-16 sm:h-20 md:h-24 overflow-hidden shadow-md bg-slate-200 snap-start"
          >
            <Image
              src={src}
              alt="Rehearsal highlight"
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
              className="object-contain object-center"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
                ))}
        </div>
    </div>
  );
}

  const [q, setQ] = useState("");

  // Search input focus from header search button
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-x-hidden">
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
        rightButtons={
          <>
                            <button
              aria-label="Switch Praise Night"
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              aria-label="Search"
              onClick={onHeaderSearchClick}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </>
        }
      />

      {/* Header-level Praise Night Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={() => setShowDropdown(false)}
          />
          <div className="fixed right-3 left-3 sm:right-4 sm:left-auto top-16 sm:top-16 z-[70] w-auto sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
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

      {/* Animated iOS-style Search Bar (slides from top) */}
      <div className={`fixed left-0 right-0 top-0 z-40 transition-transform duration-300 ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-3 flex items-center gap-2">
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

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-2 sm:py-4 relative">
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
            <span className="text-xs text-gray-600 font-medium">
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
            filteredSongs.map((song, index) => {
  return (
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
                     <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                       Singer: {song.singer || 'Sarah Johnson'}
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
            );
          })
          )}
        </div>
        
        {/* Add bottom padding to prevent content from being hidden behind sticky categories */}
                </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems} />

      {/* Bottom Bar with Categories and FAB */}
      <div className="fixed bottom-6 left-4 right-6 z-30 flex items-center justify-between">
        {/* All 3 buttons with equal spacing */}
        <div className="flex items-center justify-between w-full gap-4">
          {mainCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`flex-1 px-2 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200/50'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          
          {/* Other Categories Button - Same style as category buttons */}
          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="flex-1 px-2 py-1 rounded-full text-xs font-bold transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200"
            aria-label="Open other categories"
          >
            Other Categories
          </button>
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
                <h3 className="text-lg font-outfit-semibold text-gray-900">Filter by Category</h3>
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

      {/* Full Screen Song Detail Modal */}
      {isSongDetailOpen && selectedSong && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between">
                            <button
              onClick={handleCloseSongDetail}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <div></div>
            <div></div>
          </div>

          {/* Song Cover Art Area */}
          <div className="flex-shrink-0 px-6 pt-0 pb-4 flex justify-center">
            <div className="w-64 h-32 bg-gray-100 rounded-xl shadow-lg overflow-hidden relative animate-pulse-gentle">
              <Image
                src={getSongImage(selectedSong?.imageIndex || 0)}
                alt="Album Cover"
                fill
                className="object-cover"
                sizes="256px"
              />
              {/* iOS-style glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 pointer-events-none"></div>
              <div className="absolute inset-0 shadow-inner rounded-xl pointer-events-none"></div>
            </div>
          </div>

          {/* Song Title */}
          <div className="flex-shrink-0 px-6 py-2 text-center">
            <h1 className="text-gray-900 text-xl font-semibold">{selectedSong.title}</h1>
            <p className="text-gray-600 text-sm mt-1">Sarah Johnson</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'lyrics'
                    ? 'text-gray-900 border-b border-gray-900 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'comments'
                    ? 'text-gray-900 border-b border-gray-900 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'text-gray-900 border-b border-gray-900 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </button>
              
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab === 'lyrics' && (
              <div className="max-w-none">
                <div className="text-gray-900 leading-relaxed space-y-4 text-base">
                  {selectedSong?.lyrics ? (
                    <>
                      {selectedSong.lyrics.verse1 && (
                        <>
                          <div className="text-orange-600 text-sm font-medium mb-2">[Verse 1]</div>
                          <div className="space-y-2">
                            {selectedSong.lyrics.verse1.split('\n').map((line: string, index: number) => (
                              <p key={index} className="text-gray-700">{line}</p>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {selectedSong.lyrics.chorus && (
                        <>
                          <div className="text-orange-600 text-sm font-medium mb-2 mt-6">[Chorus]</div>
                          <div className="space-y-2">
                            {selectedSong.lyrics.chorus.split('\n').map((line: string, index: number) => (
                              <p key={index} className="text-gray-700">{line}</p>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {selectedSong.lyrics.verse2 && (
                        <>
                          <div className="text-orange-600 text-sm font-medium mb-2 mt-6">[Verse 2]</div>
                          <div className="space-y-2">
                            {selectedSong.lyrics.verse2.split('\n').map((line: string, index: number) => (
                              <p key={index} className="text-gray-700">{line}</p>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {selectedSong.lyrics.bridge && (
                        <>
                          <div className="text-orange-600 text-sm font-medium mb-2 mt-6">[Bridge]</div>
                          <div className="space-y-2">
                            {selectedSong.lyrics.bridge.split('\n').map((line: string, index: number) => (
                              <p key={index} className="text-gray-700">{line}</p>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-orange-600 text-sm font-medium mb-2">[Verse 1]</div>
                      <div className="space-y-2">
                        <p className="text-gray-700">Great is Thy faithfulness, O God my Father</p>
                        <p className="text-gray-700">There is no shadow of turning with Thee</p>
                        <p className="text-gray-700">Thou changest not, Thy compassions they fail not</p>
                        <p className="text-gray-700">As Thou hast been Thou forever wilt be</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-3">
                {/* Pastor Comment 1 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-gray-900 text-sm">Pastor</h5>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedSong?.comments || "Focus on the message of redemption and grace. Emphasize the transformation from lost to found. Sing with conviction and personal testimony."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pastor Comment 2 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-gray-900 text-sm">Pastor</h5>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Remember to pause after "I once was lost" to let the weight of the words settle. This song should minister hope to those who feel lost or broken.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pastor Comment 3 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-gray-900 text-sm">Pastor</h5>
                        <span className="text-xs text-gray-500">3 hours ago</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        The bridge should be sung with more intimacy. Lower the volume and let the Holy Spirit move through the quieter moments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
                <div>
                  {/* History Sub-tabs - Very Small Pills */}
                  <div className="flex gap-2 justify-center flex-wrap mb-4">
                    <button
                      onClick={() => setActiveHistorySubTab('lyrics')}
                      className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'lyrics'
                          ? 'text-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Lyrics
                            </button>
                    <button
                      onClick={() => setActiveHistorySubTab('lead-singer')}
                      className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'lead-singer'
                          ? 'text-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Lead Singer
                    </button>
                    <button
                      onClick={() => setActiveHistorySubTab('written-by')}
                      className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'written-by'
                          ? 'text-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Written By
                    </button>
                    <button
                      onClick={() => setActiveHistorySubTab('key')}
                      className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'key'
                          ? 'text-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Key
                    </button>
                    <button
                      onClick={() => setActiveHistorySubTab('comments')}
                      className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'comments'
                          ? 'text-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Comments
                    </button>
                    <button
                      onClick={() => setActiveHistorySubTab('audio')}
                      className={`px-2 py-0.5 rounded-full border text-xs transition-colors duration-200 whitespace-nowrap ${
                        activeHistorySubTab === 'audio'
                          ? 'text-purple-600 border-purple-600 font-medium drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                          : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Audio
                    </button>
                  </div>

                  {/* History Sub-tab Content */}
                  <div className="px-2">
                    {activeHistorySubTab === 'lyrics' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Monday, March 15, 2024 • 3:45 PM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Song Lyrics</span>
                            {isLyricsExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isLyricsExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                              <div className="space-y-4">
                                {selectedSong?.lyrics ? (
                                  <>
                                    {selectedSong.lyrics.verse1 && (
                                      <div>
                                        <p className="font-semibold text-purple-600 mb-2">[Verse 1]</p>
                                        {selectedSong.lyrics.verse1.split('\n').map((line: string, index: number) => (
                                          <p key={index}>{line}</p>
                ))}
              </div>
                                    )}
                                    
                                    {selectedSong.lyrics.chorus && (
                                      <div>
                                        <p className="font-semibold text-purple-600 mb-2">[Chorus]</p>
                                        {selectedSong.lyrics.chorus.split('\n').map((line: string, index: number) => (
                                          <p key={index}>{line}</p>
                                        ))}
        </div>
                                    )}
                                    
                                    {selectedSong.lyrics.verse2 && (
                                      <div>
                                        <p className="font-semibold text-purple-600 mb-2">[Verse 2]</p>
                                        {selectedSong.lyrics.verse2.split('\n').map((line: string, index: number) => (
                                          <p key={index}>{line}</p>
                                        ))}
      </div>
                                    )}
                                    
                                    {selectedSong.lyrics.bridge && (
                                      <div>
                                        <p className="font-semibold text-purple-600 mb-2">[Bridge]</p>
                                        {selectedSong.lyrics.bridge.split('\n').map((line: string, index: number) => (
                                          <p key={index}>{line}</p>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div>
                                    <p className="font-semibold text-purple-600 mb-2">[Verse 1]</p>
                                    <p>Great is Thy faithfulness, O God my Father</p>
                                    <p>There is no shadow of turning with Thee</p>
                                    <p>Thou changest not, Thy compassions they fail not</p>
                                    <p>As Thou hast been Thou forever wilt be</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeHistorySubTab === 'lead-singer' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Monday, April 8, 2024 • 2:20 PM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsLeadSingerExpanded(!isLeadSingerExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Lead Singer Information</span>
                            {isLeadSingerExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isLeadSingerExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Name:</p>
                                  <p>{selectedSong?.leadSinger || 'Sarah Johnson'}</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Role:</p>
                                  <p>Lead Vocalist & Worship Leader</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Experience:</p>
                                  <p>5 years leading worship, trained in classical and contemporary styles</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Vocal Range:</p>
                                  <p>Soprano (C4 - C6)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-blue-600 mb-1">Special Notes:</p>
                                  <p>Excellent at leading congregational worship, strong stage presence</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeHistorySubTab === 'written-by' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Thursday, January 12, 2023 • 10:15 AM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsWrittenByExpanded(!isWrittenByExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Songwriter Information</span>
                            {isWrittenByExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isWrittenByExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Composer:</p>
                                  <p>{selectedSong?.writtenBy || 'Pastor Chris Oyakhilome'}</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Co-writer:</p>
                                  <p>Minister John Newton (lyrics adaptation)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Original Date:</p>
                                  <p>January 12, 2023</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Inspiration:</p>
                                  <p>Written during a time of deep worship and revelation about God's amazing grace</p>
        </div>

                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Musical Style:</p>
                                  <p>Contemporary worship with gospel influences</p>
        </div>

                                <div>
                                  <p className="font-semibold text-green-600 mb-1">Copyright:</p>
                                  <p>© 2023 LoveWorld Publishing</p>
          </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeHistorySubTab === 'key' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Wednesday, March 20, 2024 • 11:30 AM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsKeyExpanded(!isKeyExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Musical Key & Details</span>
                            {isKeyExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isKeyExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Original Key:</p>
                                  <p>{selectedSong?.key || 'G Major'}</p>
                </div>
                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Alternative Keys:</p>
                                  <p>F Major (for lower voices), A Major (for higher voices)</p>
                    </div>
                                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Tempo:</p>
                                  <p>{selectedSong?.tempo || '72 BPM'} (Moderately slow, worship tempo)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Time Signature:</p>
                                  <p>4/4 (Common time)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Chord Progression:</p>
                                  <p>G - C - G - D - Em - C - G - D</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Capo Position:</p>
                                  <p>No capo required for original key</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-orange-600 mb-1">Difficulty Level:</p>
                                  <p>Intermediate (suitable for most worship teams)</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeHistorySubTab === 'comments' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Sunday, May 5, 2024 • 4:10 PM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Pastor's Historical Comments</span>
                            {isCommentsExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isCommentsExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                    <div className="space-y-4">
                                <div>
                                  <p className="font-semibold text-pink-600 mb-2">Performance Guidelines:</p>
                                  <p>"{selectedSong?.comments || 'This song should be sung with deep reverence and heartfelt emotion. Allow the congregation to really feel the weight of God\'s amazing grace.'}"</p>
                    </div>
                                
                                <div>
                                  <p className="font-semibold text-pink-600 mb-2">Spiritual Significance:</p>
                                  <p>"Every time we sing this song, we're reminded of the transformative power of God's grace. It's not just a song, but a declaration of faith."</p>
                  </div>
                                
                                <div>
                                  <p className="font-semibold text-pink-600 mb-2">Ministry Impact:</p>
                                  <p>"This song has touched countless lives during our services. Many have testified of receiving healing and breakthrough while singing these words."</p>
              </div>
                                
                                <div>
                                  <p className="font-semibold text-pink-600 mb-2">Historical Context:</p>
                                  <p>"Written during our 2023 Global Day of Prayer, this song captures the heart of our ministry - spreading God's love and grace to all nations."</p>
          </div>
                                
                                <div>
                                  <p className="font-semibold text-pink-600 mb-2">Special Instructions:</p>
                                  <p>"During the bridge, encourage the congregation to lift their hands. This is a moment of surrender and worship."</p>
        </div>
      </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeHistorySubTab === 'audio' && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 px-2">Tuesday, June 18, 2024 • 1:55 PM</p>
                        <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl shadow-sm ring-1 ring-black/5 w-full">
                          <button
                            onClick={() => setIsAudioExpanded(!isAudioExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200 rounded-2xl"
                          >
                            <span className="text-sm font-medium text-slate-700">Audio Recordings Archive</span>
                            {isAudioExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          
                          {isAudioExpanded && (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Studio Recording:</p>
                                  <p>High-quality studio version (320kbps MP3) - Duration: 4:32</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Live Performance:</p>
                                  <p>Praise Night 15 live recording - March 15, 2024 (256kbps MP3)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Rehearsal Version:</p>
                                  <p>Practice recording with vocal guide - April 8, 2024</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Instrumental Track:</p>
                                  <p>Backing track for live performances (WAV format)</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Acapella Version:</p>
                                  <p>Vocals only recording for training purposes</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Multi-track Session:</p>
                                  <p>Pro Tools session files available for remixing</p>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-indigo-600 mb-1">Total Archive Size:</p>
                                  <p>247 MB across 12 audio files</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
          </div>
        </div>
            )}
      </div>

          {/* Music Player Controls */}
          <div className="flex-shrink-0 relative">
            {/* Fade gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/0 via-white/30 to-white/90 pointer-events-none"></div>
            
            <div className="bg-gray-100/95 backdrop-blur-xl px-6 py-5 relative">
              <div className="flex items-center justify-between">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white ml-0.5" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Progress Bar */}
                <div className="w-64 mx-4">
                  <div className="relative py-2">
                    <div className="w-full h-1.5 bg-gray-400 rounded-full">
                      <div className="w-1/3 h-1.5 bg-gray-900 rounded-full"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 -translate-x-1/2">
                      <div className="w-4 h-4 bg-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"></div>
                    </div>
                  </div>
                </div>

                {/* Song Duration */}
                <div className="text-gray-900 text-sm font-medium">
                  3:24
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Fullscreen Button - Above Audio Player */}
      {isSongDetailOpen && selectedSong && activeTab === 'lyrics' && (
        <button
          onClick={() => setIsLyricsFullscreen(!isLyricsFullscreen)}
          className="fixed bottom-32 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-[80]"
          aria-label={isLyricsFullscreen ? "Close fullscreen lyrics" : "Fullscreen lyrics"}
        >
          {isLyricsFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Fullscreen Lyrics Overlay */}
      {isLyricsFullscreen && selectedSong && (
        <div className="fixed top-0 left-0 right-0 bottom-20 bg-white z-[60] flex flex-col">
          {/* Header with title only */}
          <div className="flex-shrink-0 px-6 py-4 flex items-center justify-center border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lyrics</h2>
          </div>

          {/* Fullscreen Lyrics Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-gray-900 leading-relaxed space-y-6 text-lg">
                {selectedSong?.lyrics ? (
                  <>
                    {selectedSong.lyrics.verse1 && (
                      <>
                        <div className="text-orange-600 text-base font-medium mb-3">[Verse 1]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.verse1.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-700 text-lg leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.chorus && (
                      <>
                        <div className="text-orange-600 text-base font-medium mb-3 mt-8">[Chorus]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.chorus.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-700 text-lg leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.verse2 && (
                      <>
                        <div className="text-orange-600 text-base font-medium mb-3 mt-8">[Verse 2]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.verse2.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-700 text-lg leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.bridge && (
                      <>
                        <div className="text-orange-600 text-base font-medium mb-3 mt-8">[Bridge]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.bridge.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-700 text-lg leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-orange-600 text-base font-medium mb-3">[Verse 1]</div>
                    <div className="space-y-3">
                      <p className="text-gray-700 text-lg leading-relaxed">Great is Thy faithfulness, O God my Father</p>
                      <p className="text-gray-700 text-lg leading-relaxed">There is no shadow of turning with Thee</p>
                      <p className="text-gray-700 text-lg leading-relaxed">Thou changest not, Thy compassions they fail not</p>
                      <p className="text-gray-700 text-lg leading-relaxed">As Thou hast been Thou forever wilt be</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}