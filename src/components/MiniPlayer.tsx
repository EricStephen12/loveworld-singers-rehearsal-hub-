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
  const [swipeStart, setSwipeStart] = useState({ x: 0, y: 0 });
  const [isSwipeDown, setIsSwipeDown] = useState(false);
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

  // ✅ MOUSE DRAG HANDLERS
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

  // ✅ TOUCH DRAG HANDLERS (Mobile) with iOS-style swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setSwipeStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while dragging

    const touch = e.touches[0];
    const deltaY = touch.clientY - swipeStart.y;
    const deltaX = Math.abs(touch.clientX - swipeStart.x);
    
    // Detect swipe down gesture (iOS style)
    if (deltaY > 50 && deltaX < 100) {
      setIsSwipeDown(true);
      // Add visual feedback - make player semi-transparent
      if (playerRef.current) {
        playerRef.current.style.opacity = '0.5';
        playerRef.current.style.transform = `translate(${position.x}px, ${position.y + deltaY}px) scale(0.9)`;
      }
      return;
    }

    // Normal drag behavior
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleTouchEnd = () => {
    if (isSwipeDown) {
      // Close the mini player
      onClose();
    } else {
      setIsDragging(false);
    }
    setIsSwipeDown(false);
    
    // Reset visual feedback
    if (playerRef.current) {
      playerRef.current.style.opacity = '1';
      playerRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
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
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none' // ✅ Prevent default touch actions
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Draggable Play/Pause Button - iOS style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative"
      >
        {/* Drag indicator - Top Right */}
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
