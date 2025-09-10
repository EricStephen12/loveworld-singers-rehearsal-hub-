"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

import { ChevronRight, Search, Clock, Music, User, BookOpen, Timer, Mic, Edit, ChevronDown, ChevronUp, Play, Pause, Menu, X, Bell, Users, Calendar, BarChart3, HelpCircle, Home } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { getCurrentPraiseNight, getAllPraiseNights, setCurrentPraiseNight, getCurrentSongs, Song, PraiseNight } from "@/data/songs";
import ScreenHeader from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";

export default function PraiseNightPage() {
  const [currentPraiseNight, setCurrentPraiseNightState] = useState(getCurrentPraiseNight());
  const [allPraiseNights] = useState(getAllPraiseNights());
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const songs = currentPraiseNight.songs;

  const features = [
    {
      icon: Home,
      title: 'Home',
      href: '/home',
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
      badge: 164,
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
      icon: Calendar,
      title: 'Rehearsals',
      href: '/pages/praise-night',
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

const groupSongs = (list: Song[]) => {
  const map = new Map();
  list.forEach((s: Song) => {
    if (!map.has(s.section)) map.set(s.section, new Map());
    const byStatus = map.get(s.section);
    const key = s.status || "HEARD";
    if (!byStatus.get(key)) byStatus.set(key, []);
    byStatus.get(key).push(s);
  });
  for (const [, byStatus] of map) {
    for (const [k, arr] of byStatus) {
      arr.sort((a: Song, b: Song) => a.sn - b.sn);
      byStatus.set(k, arr);
    }
  }
  return map;
};

function useActiveId(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 1] }
    );
    ids.forEach((id: string) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

  const switchPraiseNight = (praiseNight: PraiseNight) => {
    setCurrentPraiseNight(praiseNight.id);
    setCurrentPraiseNightState(praiseNight);
    setShowDropdown(false);
  };

  function Header() {
    // Calculate total rehearsal progress
    const totalRehearsals = songs.reduce((sum, song) => sum + (song.rehearsals?.count || 0) + (song.rehearsals?.extra || 0), 0);
    const totalSongs = songs.length;
    const heardSongs = songs.filter(s => s.status === "HEARD").length;
    const unheardSongs = songs.filter(s => s.status === "NOT_HEARD").length;
    
    return (
      <div className="mb-6 sm:mb-8">
        {/* Beautiful Mobile Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl" style={{overflow: 'visible'}}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl sm:rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 -z-10"></div>
          
          <div className="relative z-10">
            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src="/Untitled.jpeg"
                      alt="Praise Night Header"
                      width={70}
                      height={52}
                      className="rounded-xl shadow-lg object-cover sm:w-20 sm:h-15 ring-2 ring-white/20"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-1">
                    {currentPraiseNight.name}
                  </h1>
                  <div className="flex items-center gap-2 text-white/80 text-sm sm:text-base">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    <span>{currentPraiseNight.location}</span>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    <span>{currentPraiseNight.date}</span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/90 text-xs font-medium">{heardSongs}/{totalSongs} Songs Heard</span>
                    </div>
                    <div className="flex-1 max-w-24 bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(heardSongs/totalSongs)*100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Praise Night Selector */}
              <div className="relative w-full sm:w-auto z-50">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all duration-200 text-white"
                >
                  <span className="text-sm font-medium">Switch Praise Night</span>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>
                
                {showDropdown && (
                  <>
                    {/* Mobile backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/20 z-[60] sm:hidden"
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="fixed left-4 right-4 top-32 sm:absolute sm:top-full sm:left-0 sm:right-0 sm:left-auto mt-2 w-auto sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-[70] overflow-hidden max-h-64 overflow-y-auto">
                      {allPraiseNights.map((praiseNight) => (
                        <button
                          key={praiseNight.id}
                          onClick={() => switchPraiseNight(praiseNight)}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                            praiseNight.id === currentPraiseNight.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''
                          }`}
                        >
                          <div className="font-semibold">{praiseNight.name}</div>
                          <div className="text-sm text-slate-600">{praiseNight.location} • {praiseNight.date}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          <Clock size={10} className="sm:w-3 sm:h-3"/>
          {count ?? 0}×
        </div>
        {extra ? (
          <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
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
      <div className="text-center py-8 text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No pastor remarks yet</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {remarks.map((r: {date: string; text: string}, i: number) => (
        <div key={i} className="border-l-4 border-l-purple-400 bg-purple-50 p-4 rounded-r-lg">
          <div className="text-xs font-medium text-purple-700 mb-1">{r.date}</div>
          <p className="text-sm text-slate-700">{r.text}</p>
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
      <div className="text-center py-8 text-slate-500">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No lyrics available</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 md:p-4">
        <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Start
        </div>
        <p className="text-base md:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {lyrics.start || "No start lyrics available"}
        </p>
      </div>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 md:p-4">
        <div className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          Continue
        </div>
        <p className="text-base md:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {lyrics.continue || "No continuation lyrics available"}
        </p>
      </div>
    </div>
  );
}

function SongCard({ song }: { song: Song }) {
  const [activeTab, setActiveTab] = useState<string>('');
  return (
    <Card id={`song-${song.sn}`} className="scroll-mt-24 border-l-4 border-l-purple-400 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-purple-50">
        <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-bold text-slate-800">{song.sn}.</span>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{song.title}</h3>
            </div>
          </div>
          
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Tabs on all screen sizes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 bg-slate-100 h-auto">
              <TabsTrigger value="lyrics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-3">
                Lyrics
              </TabsTrigger>
              <TabsTrigger value="remarks" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-3">
                Pastor Remarks
              </TabsTrigger>
            </TabsList>
            {activeTab && (
              <button
                aria-label="Collapse content"
                onClick={() => setActiveTab('')}
                className="ml-3 p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
          <TabsContent value="lyrics" className="mt-6">
            <Lyrics lyrics={song.lyrics || { start: '', continue: '' }} />
          </TabsContent>
          <TabsContent value="remarks" className="mt-6">
            <RemarksTable remarks={song.remarks || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TOC({ grouped, activeId, onJump }: { 
  grouped: Map<string, Map<string, Song[]>>; 
  activeId: string | null; 
  onJump: (id: string) => void 
}) {
  const sectionColors = {
    "Previous Praise Songs Rehearsed But Not Ministered": "border-l-purple-400 bg-purple-50",
    "New Praise Songs": "border-l-blue-400 bg-blue-50",
    "Previously Done": "border-l-green-400 bg-green-50",
    "Solo": "border-l-amber-400 bg-amber-50",
    "Proposed Medley": "border-l-rose-400 bg-rose-50",
  };

  return (
    <nav className="sticky top-6 max-h-[85vh] overflow-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Table of Contents
          </h3>
        </div>
        
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {[...grouped.entries()].map(([section, byStatus]) => {
            const colorClass = sectionColors[section as keyof typeof sectionColors] || "border-l-slate-400 bg-slate-50";
            return (
              <div key={section} className={`border-l-4 ${colorClass} rounded-r-lg p-3`}>
                <div className="font-medium text-slate-800 text-sm mb-3 leading-tight">
                  {section}
                </div>
                {[...byStatus.entries()].map(([status, list]) => (
                  <div key={status} className="mb-3 last:mb-0">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      {status} ({list.length})
                    </div>
                    <ul className="space-y-1">
                      {list.map((s: Song) => {
                        const id = `song-${s.sn}`;
                        const isActive = activeId === id;
                        return (
                          <li key={id}>
                            <button
                              onClick={() => onJump(id)}
                              className={`w-full text-left text-sm rounded-lg px-3 py-2 transition-all duration-200 group ${
                                isActive 
                                  ? "bg-purple-500 text-white shadow-md" 
                                  : "hover:bg-white hover:shadow-sm text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? "rotate-90" : "group-hover:translate-x-1"}`} />
                                <span className="font-medium">{s.sn}.</span>
                                <span className="truncate">{s.title}</span>
                              </div>
                              <div className="text-xs opacity-75 mt-1 ml-5">
                                {s.leadSinger || "TBD"}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

  const [q, setQ] = useState("");
  const grouped = useMemo(() => groupSongs(
    songs.filter((s) => {
      const hay = `${s.title} ${s.writer} ${s.leadSinger} ${s.section}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    })
  ), [q, songs]);

  const allIds = useMemo(() => songs.map((s) => `song-${s.sn}`), [songs]);
  const activeId = useActiveId(allIds);

  const onJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  // Set the target date for the countdown (next Friday at 6 PM)
  const getNextPraiseNight = () => {
    const now = new Date();
    const nextFriday = new Date(now);
    
    // Set to next Friday (5 is Friday, 0 is Sunday)
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    
    // Set time to 6 PM
    nextFriday.setHours(18, 0, 0, 0);
    
    return nextFriday;
  };

  const nextPraiseNight = getNextPraiseNight();

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
      `}</style>

      {/* Shared Screen Header */}
      <ScreenHeader title="Praise Night" onMenuClick={toggleMenu} rightImageSrc="/logo.png" />
      
      <div className="mx-auto max-w-7xl p-4 md:p-6 relative">
        <Header />

        {/* Countdown Timer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
         
          <CountdownTimer 
            targetDate={nextPraiseNight} 
          />
          <p className="text-center text-xs text-slate-500 mt-2">
            {nextPraiseNight.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search songs, writer, lead singer, section…"
            className="pl-12 h-12 text-base border-slate-300 rounded-xl bg-white shadow-sm focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* TOC - Hidden on mobile, shown as sidebar on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <TOC grouped={grouped} activeId={activeId} onJump={onJump} />
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {[...grouped.entries()].map(([section, byStatus]) => (
              <div key={section} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{section}</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
                </div>
                
                {[...byStatus.entries()].map(([status, list]) => (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className={`${status === "HEARD" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"} px-3 py-1`}>
                        {status}
                      </Badge>
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-sm text-slate-500">{list.length} songs</span>
                    </div>
                    <div className="space-y-4">
                      {list.map((song: Song) => (
                        <SongCard key={song.sn} song={song} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={features} />
    </div>
  );
}