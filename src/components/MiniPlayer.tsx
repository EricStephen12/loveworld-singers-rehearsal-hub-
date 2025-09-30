"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, GripVertical } from "lucide-react";
import { PraiseNightSong } from "@/types/supabase";

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('miniPlayerPosition');
    if (saved) {
      setPosition(JSON.parse(saved));
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('miniPlayerPosition', JSON.stringify(position));
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!currentSong) return null;

  return (
    <div
      ref={playerRef}
      className="fixed bottom-20 right-4 z-50"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Draggable Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative"
      >
        {/* Drag indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
          <GripVertical className="w-3 h-3 text-purple-600" />
        </div>

        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-0.5" />
        )}
      </button>
    </div>
  );
}
