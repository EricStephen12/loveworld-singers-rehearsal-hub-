'use client';

import React, { useState } from 'react';
import { Play, Pause, MoreHorizontal, Clock, Repeat, Heart } from 'lucide-react';
import BottomSheet from './BottomSheet';

interface SongCardProps {
  title: string;
  artist: string;
  duration: string;
  practiced: number;
  isPlaying?: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export default function SongCard({
  title,
  artist,
  duration,
  practiced,
  isPlaying = false,
  onPlay,
  onPause
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
      <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <p className="text-sm text-gray-600 truncate">{artist}</p>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{duration}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                <Repeat className="w-3 h-3" />
                <span>{practiced}x</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setShowOptions(true)}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isPlaying 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg' 
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
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
