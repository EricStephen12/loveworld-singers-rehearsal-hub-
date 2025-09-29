'use client';

import React, { useState } from 'react';
import { Play, Pause, MoreHorizontal, Clock, Repeat, Heart, ChevronRight } from 'lucide-react';
import BottomSheet from './BottomSheet';

interface SongCardProps {
  title: string;
  artist: string;
  duration: string;
  practiced: number;
  isPlaying?: boolean;
  onPlay: () => void;
  onPause: () => void;
  index: number;
}

export default function SongCard({
  title,
  artist,
  duration,
  practiced,
  isPlaying = false,
  onPlay,
  onPause,
  index
}: SongCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <>
      <div className={`bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group cursor-pointer ${
        isPlaying 
          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-200/50 bg-purple-50/30'
          : 'ring-1 ring-black/5'
      }`}>
        {/* Song Header - Matching App Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
              <span className="text-sm font-semibold text-purple-600">
                {index + 1}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 text-sm group-hover:text-black leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight font-bold">
                Artist: {artist}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Practice Count */}
            <div className="px-2 py-1 bg-purple-100 rounded-full">
              <span className="text-xs font-bold text-purple-600">
                x{practiced}
              </span>
            </div>
            {/* Duration */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isPlaying 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg' 
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            {/* Options Button */}
            <button
              onClick={() => setShowOptions(true)}
              className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Options Bottom Sheet */}
      <BottomSheet
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        title="Song Options"
      >
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Play Song</div>
              <div className="text-sm text-gray-600">Start multitrack playback</div>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Repeat className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Practice Mode</div>
              <div className="text-sm text-gray-600">Practice with AI feedback</div>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Add to Favorites</div>
              <div className="text-sm text-gray-600">Save to your favorites list</div>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">More Options</div>
              <div className="text-sm text-gray-600">Share, download, and more</div>
            </div>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
