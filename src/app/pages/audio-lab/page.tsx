'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Loader2
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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Audio Lab</h1>
              <p className="text-xs text-slate-500">Practice & Record</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

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

  // Filter songs by ongoing category
  const songs = allSongs?.filter((song: any) => song.category === 'ongoing') || [];
  
  console.log('🎵 All songs loaded:', allSongs?.length || 0);
  console.log('🎵 Songs in ongoing category:', songs.length);
  console.log('🎵 Available categories:', [...new Set(allSongs?.map((song: any) => song.category) || [])]);

  const handlePlay = (songId: string) => {
    setCurrentlyPlaying(songId);
    // Here you would implement actual audio playback
  };

  const handlePause = () => {
    setCurrentlyPlaying(null);
    // Here you would implement actual audio pause
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Song Library</h2>
        <p className="text-slate-600 text-sm">Choose a song to start practicing</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 text-sm">Loading songs...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-red-600 text-sm font-medium hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && songs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Songs Available</h3>
          <p className="text-slate-600 text-sm mb-4">No songs found in the ongoing category.</p>
          {allSongs && allSongs.length > 0 && (
            <div className="text-xs text-slate-500">
              <p>Found {allSongs.length} songs in other categories:</p>
              <p className="mt-1">{[...new Set(allSongs.map((song: any) => song.category))].join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Song List */}
      {!loading && !error && songs.length > 0 && (
        <div className="space-y-3">
          {songs.map((song: any, index) => (
            <SongCard
              key={song.id}
              title={song.title}
              artist={song.leadsinger || 'Unknown Artist'}
              duration="4:32" // You might want to calculate this from audio file
              practiced={song.rehearsalcount || 0}
              isPlaying={currentlyPlaying === song.id.toString()}
              onPlay={() => handlePlay(song.id.toString())}
              onPause={handlePause}
              index={index}
            />
          ))}
        </div>
      )}
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
