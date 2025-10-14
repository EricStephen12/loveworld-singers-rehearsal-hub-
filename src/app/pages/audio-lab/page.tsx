"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
import AuthGuard from '@/components/AuthGuard';
import {
  Music,
  Mic,
  Users,
  Radio,
  ArrowLeft,
  Search,
  Play,
  MoreVertical,
  Clock,
  ListMusic,
  Plus,
  X,
  ChevronRight
} from 'lucide-react';

function AudioLabContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Library');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Firebase songs
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load songs from Firebase
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const allSongs = await PraiseNightSongsService.getAllSongs();
        setSongs(allSongs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading songs:', error);
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  // Filter songs based on search
  const filteredSongs = songs.filter(song =>
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Responsive Container with Max Width */}
      <div className="w-full max-w-2xl mx-auto flex flex-col h-full">

        {/* Fixed Header - Matches Home Page */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
              {/* Normal Header Content */}
              <div className={`flex items-center justify-between px-3 sm:px-4 py-3 transition-all duration-300 ease-out ${
                isSearchOpen ? 'opacity-0' : 'opacity-100'
              }`}>
                {/* Left Section - Back Button */}
                <button
                  onClick={() => router.back()}
                  className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 active:scale-95 hover:bg-gray-100/70"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* Center - Title */}
                <h1 className="text-lg font-semibold text-gray-800">Audio Lab</h1>

                {/* Right Section - Search Button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 active:scale-95 hover:bg-gray-100/70"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Header Search Overlay */}
              <div className={`absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${
                isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
              }`}>
                <div className="flex items-center justify-between px-4 py-3 h-full">
                  <div className="flex-1 relative">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                      placeholder="Search songs, artists, genres..."
                      className="w-full text-lg bg-transparent px-0 py-3 text-gray-800 placeholder-gray-400 border-0 outline-none"
                      autoFocus
                    />
                    <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300/40" />
                    <div className="absolute left-0 bottom-0 h-0.5 bg-purple-500 w-full" />
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 rounded-full transition-all duration-200 focus:outline-none active:scale-95 hover:bg-gray-100/70 ml-4"
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-16 pb-20" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className="w-full px-3 sm:px-4 py-4">

            {/* Tab Content */}
            {activeTab === 'Library' && (
              <div className="space-y-4">
                {/* Songs List */}
                {filteredSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No songs found</h3>
                    <p className="text-sm text-gray-400">Try a different search</p>
                  </div>
                ) : (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.97] border-0 hover:bg-white/90 ring-1 ring-black/5"
                    >
                      {/* Album Art */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Music className="w-6 h-6 text-purple-600" />
                      </div>

                      {/* Song Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {song.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {song.artist}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-purple-600 font-medium">
                            {song.genre || 'Worship'}
                          </span>
                          {song.duration && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {song.duration}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="p-2 rounded-full hover:bg-purple-100 transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'Practice' && (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Practice Mode</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            )}

            {activeTab === 'Collab' && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Collaboration</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            )}

            {activeTab === 'Studio' && (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Recording Studio</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation - Matches Home Page Style */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 w-full">
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-4 gap-1 px-2 py-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => setActiveTab('Library')}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'Library'
                    ? 'bg-purple-100/70 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100/50'
                }`}
              >
                <Music className="w-5 h-5 mb-1" strokeWidth={activeTab === 'Library' ? 2.5 : 2} />
                <span className="text-xs font-medium">Library</span>
              </button>

              <button
                onClick={() => setActiveTab('Practice')}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'Practice'
                    ? 'bg-purple-100/70 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100/50'
                }`}
              >
                <Mic className="w-5 h-5 mb-1" strokeWidth={activeTab === 'Practice' ? 2.5 : 2} />
                <span className="text-xs font-medium">Practice</span>
              </button>

              <button
                onClick={() => setActiveTab('Collab')}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'Collab'
                    ? 'bg-purple-100/70 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100/50'
                }`}
              >
                <Users className="w-5 h-5 mb-1" strokeWidth={activeTab === 'Collab' ? 2.5 : 2} />
                <span className="text-xs font-medium">Collab</span>
              </button>

              <button
                onClick={() => setActiveTab('Studio')}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'Studio'
                    ? 'bg-purple-100/70 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100/50'
                }`}
              >
                <Radio className="w-5 h-5 mb-1" strokeWidth={activeTab === 'Studio' ? 2.5 : 2} />
                <span className="text-xs font-medium">Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudioLabPage() {
  return <AuthGuard><AudioLabContent /></AuthGuard>;
}
