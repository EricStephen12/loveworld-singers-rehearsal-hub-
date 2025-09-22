"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import { PraiseNightSong } from "@/types/supabase";

interface AudioContextType {
  currentSong: PraiseNightSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  hasError: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isToggling, setIsToggling] = useState(false);

  const togglePlayPause = () => {
    // Prevent rapid clicking
    if (isToggling) {
      console.log('🚫 Ignoring rapid click');
      return;
    }

    setIsToggling(true);
    setTimeout(() => setIsToggling(false), 300); // 300ms debounce

    console.log('🎵 togglePlayPause called:', {
      isPlaying,
      hasAudioRef: !!audioRef.current,
      audioSrc: audioRef.current?.src,
      songTitle: currentSong?.title
    });

    if (audioRef.current) {
      if (isPlaying) {
        console.log('⏸️ Pausing audio');
        audioRef.current.pause();
      } else {
        // Check if audio source is set and valid before trying to play
        if (!audioRef.current.src || audioRef.current.src === '') {
          console.warn('No audio source set. Cannot play audio.');
          return;
        }

        console.log('▶️ Playing audio:', audioRef.current.src);

        // Use a promise to handle play() properly
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Audio started playing successfully');
            })
            .catch((error) => {
              console.error('❌ Error playing audio:', error);
              console.error('Audio source:', audioRef.current?.src);
              console.error('Current song:', currentSong?.title);
              console.error('Audio file URL:', currentSong?.audioFile);
              // Reset playing state if play failed
              setIsPlaying(false);
            });
        }
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
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio metadata loaded successfully');
      console.log('✅ Duration:', audioRef.current.duration);
      console.log('✅ Ready state:', audioRef.current.readyState);
      // Auto-play if requested and audio is ready
      if (shouldAutoPlay && currentSong?.audioFile && currentSong.audioFile.trim() !== '') {
        console.log('Audio loaded, auto-playing:', currentSong.title);
        audioRef.current.play().catch((error) => {
          console.error('Error auto-playing after load:', error);
          setHasError(true);
        });
        setShouldAutoPlay(false); // Reset auto-play flag
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Dispatch custom event for repeat functionality
    const event = new CustomEvent('audioEnded', {
      detail: { song: currentSong }
    });
    window.dispatchEvent(event);
  };

  const handlePlay = () => {
    console.log('🎵 Audio play event fired');
    setIsPlaying(true);
  };

  const handlePause = () => {
    console.log('🎵 Audio pause event fired');
    setIsPlaying(false);
  };

  const handleError = (e: any) => {
    console.error('❌ Audio error details:', {
      error: e,
      currentSong: currentSong?.title,
      audioFile: currentSong?.audioFile,
      audioSrc: audioRef.current?.src,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState
    });
    console.error('❌ Audio error code:', audioRef.current?.error?.code);
    console.error('❌ Audio error message:', audioRef.current?.error?.message);

    // Test if the URL is accessible
    if (currentSong?.audioFile) {
      console.log('🔍 Testing audio URL accessibility:', currentSong.audioFile);
      fetch(currentSong.audioFile, { method: 'HEAD' })
        .then(response => {
          console.log('🔍 URL test result:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
        })
        .catch(fetchError => {
          console.error('🔍 URL fetch failed:', fetchError);
        });
    }

    setIsPlaying(false);
    setIsLoading(false);
    setHasError(true);
  };

  // Update audio source when song changes
  useEffect(() => {
    console.log('Audio loading effect triggered for song:', currentSong?.title);
    console.log('Audio file URL:', currentSong?.audioFile);

    if (currentSong?.audioFile && audioRef.current && currentSong.audioFile.trim() !== '') {
      try {
        // Reset audio state
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(true);
        setHasError(false);

        // Check if the audio file URL looks valid (Cloudinary URLs or other valid URLs)
        if (currentSong.audioFile.startsWith('http') || currentSong.audioFile.startsWith('https')) {
          // Don't encode URLs that are already properly encoded (like Cloudinary URLs)
          const urlToUse = currentSong.audioFile;

          console.log('🎵 Loading audio file for song:', currentSong.title);
          console.log('🎵 Audio URL:', urlToUse);
          console.log('🎵 URL length:', urlToUse.length);
          console.log('🎵 URL domain:', new URL(urlToUse).hostname);

          audioRef.current.src = urlToUse;
          audioRef.current.load();
        } else {
          console.warn('❌ Invalid audio file URL (not HTTP/HTTPS):', currentSong.audioFile);
          if (audioRef.current) {
            audioRef.current.src = '';
          }
          setIsLoading(false);
          setHasError(true);
        }
      } catch (error) {
        console.error('❌ Error loading audio file:', error);
        if (audioRef.current) {
          audioRef.current.src = '';
        }
        setIsLoading(false);
        setHasError(true);
      }
    } else if (audioRef.current) {
      audioRef.current.src = '';
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      setHasError(false);
      console.log('🧹 Clearing audio source - no valid audio file');
    }
  }, [currentSong]);

  const setCurrentSongWithAutoPlay = (song: PraiseNightSong | null, autoPlay: boolean = false) => {
    console.log('🎵 Setting current song:', song?.title, 'autoPlay:', autoPlay);
    console.log('🎵 Song audioFile:', song?.audioFile);
    console.log('🎵 Song mediaId:', song?.mediaId);

    // Stop current playback when changing songs
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }

    setCurrentSong(song);
    setShouldAutoPlay(autoPlay);
  };

  const setCurrentTimeManual = (time: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const setDurationManual = (newDuration: number) => {
    setDuration(newDuration);
  };

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    hasError,
    audioRef,
    setCurrentSong: setCurrentSongWithAutoPlay,
    togglePlayPause,
    play,
    pause,
    stop,
    setCurrentTime: setCurrentTimeManual,
    setDuration: setDurationManual,
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
        crossOrigin="anonymous"
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