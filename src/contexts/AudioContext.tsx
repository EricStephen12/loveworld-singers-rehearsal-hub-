"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import { PraiseNightSong } from "@/data/praise-night-songs";

interface AudioContextType {
  currentSong: PraiseNightSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  setCurrentSong: (song: PraiseNightSong | null, autoPlay?: boolean) => void;
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<PraiseNightSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const play = () => {
    if (audioRef.current && currentSong?.audioFile && currentSong.audioFile.trim() !== '') {
      // Check if audio is ready to play
      if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          console.log('Audio file:', currentSong.audioFile);
          console.log('Ready state:', audioRef.current?.readyState);
        });
      } else {
        console.log('Audio not ready to play, readyState:', audioRef.current.readyState);
        // Wait for audio to be ready
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.play().catch((error) => {
              console.error('Error playing audio after waiting:', error);
            });
            audioRef.current.removeEventListener('canplay', handleCanPlay);
          }
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
      console.log('Cannot play: no audio file or audio element');
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Auto-play if requested and audio is ready
      if (shouldAutoPlay && currentSong?.audioFile && currentSong.audioFile.trim() !== '') {
        console.log('Audio loaded, auto-playing:', currentSong.title);
        audioRef.current.play().catch((error) => {
          console.error('Error auto-playing after load:', error);
        });
        setShouldAutoPlay(false); // Reset auto-play flag
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = (e: any) => {
    console.error('Audio error details:', {
      error: e,
      currentSong: currentSong?.title,
      audioFile: currentSong?.audioFile,
      audioSrc: audioRef.current?.src,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState
    });
    setIsPlaying(false);
  };

  // Update audio source when song changes
  useEffect(() => {
    if (currentSong?.audioFile && audioRef.current && currentSong.audioFile.trim() !== '') {
      try {
        // Check if the audio file path looks valid
        if (currentSong.audioFile.startsWith('/audio/') && currentSong.audioFile.endsWith('.mp3')) {
          // Properly encode the URL to handle special characters like parentheses
          const encodedUrl = encodeURI(currentSong.audioFile);
          audioRef.current.src = encodedUrl;
          audioRef.current.load();
          console.log('Loading audio file:', currentSong.audioFile, 'Encoded:', encodedUrl);
        } else {
          console.warn('Invalid audio file path:', currentSong.audioFile);
          if (audioRef.current) {
            audioRef.current.src = '';
          }
        }
      } catch (error) {
        console.error('Error loading audio file:', error);
        if (audioRef.current) {
          audioRef.current.src = '';
        }
      }
    } else if (audioRef.current) {
      audioRef.current.src = '';
      console.log('Clearing audio source - no valid audio file');
    }
  }, [currentSong]);

  const setCurrentSongWithAutoPlay = (song: PraiseNightSong | null, autoPlay: boolean = false) => {
    setCurrentSong(song);
    setShouldAutoPlay(autoPlay);
  };

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    audioRef,
    setCurrentSong: setCurrentSongWithAutoPlay,
    togglePlayPause,
    play,
    pause,
    stop,
    setCurrentTime,
    setDuration,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        preload="metadata"
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
