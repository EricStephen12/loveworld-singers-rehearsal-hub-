"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { PraiseNightSong } from "@/data/praise-night-songs";

interface MiniPlayerProps {
  currentSong: PraiseNightSong | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  onOpenFullPlayer: () => void;
}

export default function MiniPlayer({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onClose, 
  onOpenFullPlayer 
}: MiniPlayerProps) {
  if (!currentSong) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Main Play/Pause Button Only - Smaller */}
      <button
        onClick={onPlayPause}
        className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>
    </div>
  );
}
