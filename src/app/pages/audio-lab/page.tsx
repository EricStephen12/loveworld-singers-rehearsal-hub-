'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Play,
  Mic,
  Video,
  Music,
  Headphones,
  Settings,
  Search,
  Filter,
  Loader2,
  ChevronDown,
  MoreHorizontal,
  Pause
} from 'lucide-react';
import SongCard from '@/components/audio-lab/SongCard';
import BottomSheet from '@/components/audio-lab/BottomSheet';
import { getSongsByCategory } from '@/lib/database';
import { PraiseNightSong } from '@/types/supabase';
import { useUltraFastSupabase } from '@/hooks/useUltraFastSupabase';

// Bottom tab types
type TabType = 'library' | 'player' | 'practice' | 'recording';

export default function AudioLabPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const tabs = [
    {
      id: 'library' as TabType,
      label: 'Library',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'player' as TabType,
      label: 'Player',
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'practice' as TabType,
      label: 'Practice',
      icon: Mic,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'recording' as TabType,
      label: 'Record',
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryTab />;
      case 'player':
        return <PlayerTab />;
      case 'practice':
        return <PracticeTab />;
      case 'recording':
        return <RecordingTab />;
      default:
        return <LibraryTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Bottom Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 py-3 safe-area-bottom shadow-sm">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-50 scale-105 shadow-sm' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive ? tab.bgColor : 'bg-slate-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive ? tab.color : 'text-slate-500'
                  }`} />
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-purple-600' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter & Sort"
      >
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
            <div className="space-y-2">
              {['Recently Added', 'Most Practiced', 'Alphabetical', 'Duration'].map((option) => (
                <button
                  key={option}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Filter By</h3>
            <div className="space-y-2">
              {['Unheard Songs', 'Practiced Songs', 'Favorites', 'Downloaded'].map((option) => (
                <label key={option} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <input type="checkbox" className="mr-3 text-purple-600 rounded" />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

// Library Tab Component
function LibraryTab() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');

  // Use ultra-fast Supabase hook to load songs
  const {
    data: allSongs,
    loading,
    error,
    refresh
  } = useUltraFastSupabase({
    table: 'songs',
    select: '*',
    orderBy: { column: 'id', ascending: true },
    enableRealtime: true,
    cacheTime: 10000, // 10 seconds cache
  });

  // Filter songs by ongoing category and search query
  const songs = allSongs?.filter((song: any) => {
    const matchesCategory = song.category === 'ongoing';
    const matchesSearch = searchQuery === '' ||
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.leadsinger?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Mock data for demonstration (matching the design)
  const mockSongs = [
    {
      id: 1,
      title: "Dancing in the Moonlight",
      genre: "Pop Rock",
      lastPracticed: "2 days ago",
      artwork: "/images/dancing-moonlight.jpg"
    },
    {
      id: 2,
      title: "Stairway to Heaven",
      genre: "Rock",
      lastPracticed: "1 week ago",
      artwork: "/images/stairway-heaven.jpg"
    },
    {
      id: 3,
      title: "Lost in Translation",
      genre: "Indie Pop",
      lastPracticed: "Never",
      artwork: "/images/lost-translation.jpg"
    },
    {
      id: 4,
      title: "Electric Dreams",
      genre: "Synth-pop",
      lastPracticed: "1 month ago",
      artwork: "/images/electric-dreams.jpg"
    }
  ];

  const displaySongs = songs.length > 0 ? songs : mockSongs;

  const handlePlay = (songId: string) => {
    setCurrentlyPlaying(songId);
  };

  const handlePause = () => {
    setCurrentlyPlaying(null);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-transparent group/design-root overflow-x-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 ios-blur">
        <div className="text-black flex size-12 shrink-0 items-center" data-icon="ArrowLeft" data-size="24px" data-weight="regular">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </div>
        <h2 className="text-black text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Audio Lab</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-black gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <div className="text-black" data-icon="DotsThreeVertical" data-size="24px" data-weight="regular">
              <span className="material-symbols-outlined text-2xl">more_vert</span>
            </div>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="relative">
          <div className="w-full h-64 bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl shadow-lg" data-alt="Playlist cover art for Audio Lab" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSIqxUYCT95MTWVYymSZjmeFcqtt2OwYw7wEtgvCWo4nUIcqppB4P18UVWGTSwSsjFjjCBSfu1GQ_NeylmzJUwmxM21wO1jYKSrHhba-UHwgdMgyMkGGLbSBLz_keiWNvC1kTBhC6NlyKY4mezgAZABsytvEVjuNyOZjo2qCPIUaHGwU7ZffMLc0a2aKhJ1LpLBJ7t1WlCwJxXZ-W8dzSZn0-SeOouRcEGAyNr8krWxb97RKCWAA_z0SM479Z5y3X_qLjMBjEXCmI")'}}></div>
          <div className="absolute bottom-4 right-4">
            <button className="bg-purple-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl">play_arrow</span>
            </button>
          </div>
        </div>
        <h1 className="text-black tracking-light text-[32px] font-bold leading-tight pt-6">Audio Lab</h1>
        <p className="text-gray-800 text-base font-normal leading-normal pt-1">By You</p>
        <p className="text-gray-600 text-sm font-normal leading-normal pt-1">345 songs, 21 hr 30 min</p>
        <div className="flex items-center mt-4 gap-4">
          <button className="text-black">
            <span className="material-symbols-outlined text-3xl">shuffle</span>
          </button>
          <button className="text-black">
            <span className="material-symbols-outlined text-3xl">more_horiz</span>
          </button>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-black font-bold text-lg">Categories</h3>
            <button className="text-gray-600 text-sm font-medium flex items-center gap-1">
              Manage
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button className="bg-white/80 text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">All</button>
            <button className="bg-white/40 text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Focus</button>
            <button className="bg-white/40 text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Workout</button>
            <button className="bg-white/40 text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Chill</button>
            <button className="bg-white/40 text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Indie</button>
            <button className="bg-transparent text-gray-700 px-3 py-2 rounded-full text-sm font-medium border border-dashed border-gray-500 flex items-center gap-1 whitespace-nowrap">
              <span className="material-symbols-outlined text-lg">add</span>
              New
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for Blinding Lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABduBsCQBO3OHPsiMIDHdFJA80MlAmqcMMT6-2_ENxe8PjXyLcQsTy6JuhWzuXa5GxUOTMhVc0U4-eceHsnu_gtcyX6hA-TJhhcFbjexYtkELsWqwwZMePQyHgu-q8iTRyEzSITf4_0yJfth1Un4P0TGJ94NZEYvszRXN_-nMNJPs3u8UMhSFpmo9eCiBhojgSayL68XHVcRgv4Ydr8KNpwq-cIDC8EwqB6yAc3PAwzvSJ5I5UU_2I3A6_1lwlgUPviUvd6GBL06Y"/>
          <div className="flex-1">
            <p className="text-black font-bold">Blinding Lights</p>
            <p className="text-gray-600 text-sm">The Weeknd</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">3:20</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for Levitating" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBadolXDFYVOj0FbD60B9H06Sinr3j2_d2jVtrONYAuQjo26MpPOO8lHdiS1bFX95ZmJbD4OFPiEyIotjVqzjYGGQtFriklg8MZ9pNhoZ9hDvK5YPkvuN9vK59IJ-C494LkVMGzG7KX2flvuBd6WB73TAeubSxFErAM93B47ybSIY8T3917oDAM1PvR6VNFoYl6G6N5bWMzpTYCYSMV5SvXI1F1qAO1u41z9KOi4MsSlVZ1JjM9diLNgKEmuEv9dfgwjLXUuOUCSk"/>
          <div className="flex-1">
            <p className="text-black font-bold">Levitating</p>
            <p className="text-gray-600 text-sm">Dua Lipa</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">3:23</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for Heat Waves" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP3u3blZydXOHlf8828emjQPb1kYLcmp2I6EQhutcYNzVCDi5TSbNrwBLmmR1wqXuH8jmwIbUiXtWpX925ZdKqPmvAHNAmWSRPG4BX5BxhYZLFGE7COrXj1cvETq-SWb9pWiIyn2Zhr4x56zTAc78YMq6fsHS7uQT520UzBGb_QE0ejbWcWdBtils8a1uzetA8Y4zUOZzWAW6WJlYhGGnccnf08zw46iSR0MA-VoxoCHfMjKYT1oTkHaIn-w7uGbU4Kbsb9cKDOw8"/>
          <div className="flex-1">
            <p className="text-black font-bold">Heat Waves</p>
            <p className="text-gray-600 text-sm">Glass Animals</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">3:58</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for good 4 u" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_c2t8J4qPTktQmsMSOKK3mTfpFsyUK_LHzIGyODIjkVI6X10cGPgc1Aq1iXVDlSheyRASr08O9I1zguHOtS6GcVQNNShZq0V1vu4mxDa6ckWewlIVGVSs_Fnu4AHijHicJcw0ggrE1Ww5qeAYvxDEr7Gt4jjyPMR6hZC0zAFw7c6-qb6Rb0m3tBNrEadLOq2ZRUToIdqVXPpO7wGxUGFwcqqbFTE_XZdaeQoTJand8MBqxs1e7_DgGrHsy82x4JrcBDOCtAzn42A"/>
          <div className="flex-1">
            <p className="text-black font-bold">good 4 u</p>
            <p className="text-gray-600 text-sm">Olivia Rodrigo</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">2:58</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for Montero" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYz3hfIZTENzMq9ufG5-1mL5Qwubu5o_v4-HZXxrDReKCL78YZLVctEaLUaDBjg4Ueo1rcG5-jWj2nFGbJpnotwxE8yfWCv6kB9JwDnVmSIda0SwxybqUz94-V-kYe_SfC9ZQ4PnyBLCcAC0ayWyIBMg79mBdsd0gJsXtpOZBqqSGbjkBJjCeRXNPY4q_WgETSIu10zGThLiU-O0ZECdll8FU3_SP6B6vKOZlVuFJeI8RLcC4lEEgAOvB7CKn1g6vDllT7xp0cxXk"/>
          <div className="flex-1">
            <p className="text-black font-bold">MONTERO (Call Me By Your Name)</p>
            <p className="text-gray-600 text-sm">Lil Nas X</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">2:17</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="flex items-center py-2">
          <img className="w-12 h-12 rounded-md mr-4 shadow-md" data-alt="Album art for Peaches" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi5wijUiq-DLCFuZBHeQKMvHboJX3uxucBSjg5XijRHjcwI1KbyFl8AgU9tkpxz808PspdN-BjZ4G2y98G_erSg0j-m44ghyOlfiEh_V5BdP1Tya2RA9akdpuw_Fv2AUWk-Mu09Aq_V5CyHo_Vbxe-6M5hIsh-M9z4PHyUqDoPcfT3bTxM1bEL3uZO1Vw1_1kkHcz4a4C87S1X8INNv1hAHHe9ooKD1JcU6BXvszESaGTpZ8r_x8BOxDnK7ZsbENeqGjPfNNLkIJ4"/>
          <div className="flex-1">
            <p className="text-black font-bold">Peaches</p>
            <p className="text-gray-600 text-sm">Justin Bieber ft. Daniel Caesar, Giveon</p>
          </div>
          <p className="text-gray-600 text-sm mr-4">3:18</p>
          <button className="text-black">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-2 flex items-center shadow-lg ios-blur border-t border-white/30">
        <img className="w-12 h-12 rounded-md mr-3 shadow-md" data-alt="Album art for Stay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAghbAbjXSsPVFITZNWUh6Az4sXUvSwP_c67O7g5hoOLo48igJ7PhmWZkBN5EDyswkSdw3Ylrbao8BRvKjyzVaQpYv9hU3zLh4VHR7VkDX747aM0FIyW5MJ97P1CAitevIJtXmUHvg8ymq_v7v3T7P72jdtlaqEDMlbfbuEtio1dY3iMngnQXc3tS4owUjUS5097vQB-4sK9SXZmc5JdsfHhd3tYtO60TpD7qLS9ErEjuud2q5mHBcuA5uBGrVf05U2F04EViPx3rY"/>
        <div className="flex-1">
          <p className="text-black font-semibold">Stay</p>
          <p className="text-gray-700 text-xs">The Kid LAROI, Justin Bieber</p>
        </div>
        <div className="flex items-center text-black space-x-4">
          <button>
            <span className="material-symbols-outlined text-3xl">skip_previous</span>
          </button>
          <button className="bg-black text-white rounded-full h-10 w-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">pause</span>
          </button>
          <button>
            <span className="material-symbols-outlined text-3xl">skip_next</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Player Tab Component
function PlayerTab() {
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Play className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Song Selected</h3>
        <p className="text-slate-600 text-sm">Choose a song from the Library to start playing</p>
      </div>
    </div>
  );
}

// Practice Tab Component
function PracticeTab() {
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Mic className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Practice Mode</h3>
        <p className="text-slate-600 text-sm">Select a song to start practicing with AI feedback</p>
      </div>
    </div>
  );
}

// Recording Tab Component
function RecordingTab() {
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Video className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Recording Studio</h3>
        <p className="text-slate-600 text-sm">Create and collaborate on musical recordings</p>
      </div>
    </div>
  );
}
