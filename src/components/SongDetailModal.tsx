"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookOpen, Music, Users, Clock, Play, Pause, SkipBack, SkipForward, RotateCcw, Music2, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { PraiseNightSong, HistoryEntry } from "@/types/supabase";
import { useAudio } from "@/contexts/AudioContext";

interface SongDetailModalProps {
  selectedSong: PraiseNightSong | null;
  isOpen: boolean;
  onClose: () => void;
  onSongChange?: (song: PraiseNightSong) => void;
  currentFilter?: 'heard' | 'unheard'; // Add current filter prop
  songs?: PraiseNightSong[]; // Add songs prop
}

export default function SongDetailModal({ selectedSong, isOpen, onClose, onSongChange, currentFilter = 'heard', songs = [] }: SongDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'solfas' | 'comments' | 'history'>('lyrics');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'lyrics' | 'audio' | 'solfas' | 'comments' | 'metadata'>('lyrics');
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [categorySongs, setCategorySongs] = useState<PraiseNightSong[]>([]);
  const [collapsedHistoryCards, setCollapsedHistoryCards] = useState<Set<string>>(new Set([
    'lyrics-1', 'lyrics-2', 'lyrics-3', 'lyrics-4',
    'audio-1', 'audio-2', 'audio-3',
    'solfas-1', 'solfas-2', 'solfas-3',
    'comment-1', 'comment-2', 'comment-3', 'comment-4'
  ]));
  
  // State for history audio players
  const [historyAudioStates, setHistoryAudioStates] = useState<{[key: string]: {isPlaying: boolean, currentTime: number, duration: number}}>({});
  const historyAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [mainPlayerWasPlaying, setMainPlayerWasPlaying] = useState(false);
  
  // Use global audio context
  const { isPlaying, currentTime, duration, isLoading, hasError, togglePlayPause, audioRef, setCurrentSong } = useAudio();

  // Set the current song when modal opens (only once per song)
  useEffect(() => {
    if (selectedSong && isOpen) {
      console.log('🎵 SongDetailModal: Setting current song:', {
        title: selectedSong.title,
        audioFile: selectedSong.audioFile,
        hasAudioFile: !!selectedSong.audioFile,
        audioFileLength: selectedSong.audioFile?.length
      });
      setCurrentSong(selectedSong, false);
    }
  }, [selectedSong?.title, isOpen]); // Remove setCurrentSong from dependencies to prevent loop

  // Load songs from the same category AND current filter, find current song index
  useEffect(() => {
    if (selectedSong) {
      const songsInCategory = songs.filter(song => 
        song.category === selectedSong.category && song.status === currentFilter
      );
      setCategorySongs(songsInCategory);
      
      const index = songsInCategory.findIndex(song => song.title === selectedSong.title);
      setCurrentSongIndex(index >= 0 ? index : 0);
    }
  }, [selectedSong, currentFilter, songs]);

  // Handle audio ended event for repeat functionality
  useEffect(() => {
    const handleAudioEnded = (event: CustomEvent) => {
      console.log('🔄 Audio ended, repeat mode:', isRepeating);
      if (isRepeating && event.detail.song?.title === selectedSong?.title) {
        console.log('🔄 Repeating song:', selectedSong?.title);
        // Restart the current song
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.error('Error repeating song:', error);
          });
        }
      }
    };

    window.addEventListener('audioEnded', handleAudioEnded as EventListener);
    return () => {
      window.removeEventListener('audioEnded', handleAudioEnded as EventListener);
    };
  }, [isRepeating, selectedSong?.title]);

  const handlePrevious = () => {
    console.log('⏮️ Previous clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    
    if (currentSongIndex > 0 && categorySongs.length > 0) {
      // Go to previous song
      const prevSong = categorySongs[currentSongIndex - 1];
      console.log('⏮️ Going to previous song:', prevSong.title);
      if (prevSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex - 1);
        onSongChange(prevSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(prevSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at first song or no songs, skip back 10 seconds
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
      console.log('⏮️ Skipped back 10 seconds to:', newTime);
    }
  };

  const handleNext = () => {
    console.log('⏭️ Next clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    
    if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
      // Go to next song
      const nextSong = categorySongs[currentSongIndex + 1];
      console.log('⏭️ Going to next song:', nextSong.title);
      if (nextSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex + 1);
        onSongChange(nextSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(nextSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at last song or no songs, skip forward 10 seconds
      const newTime = Math.min(duration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
      console.log('⏭️ Skipped forward 10 seconds to:', newTime);
    }
  };

  const toggleRepeat = () => {
    const newRepeatState = !isRepeating;
    setIsRepeating(newRepeatState);
    console.log('🔄 Repeat toggled:', newRepeatState ? 'ON' : 'OFF');
  };

  const handleMusicPage = () => {
    // Navigate to music page - you can implement this based on your routing
    console.log('Navigate to music page');
  };

  const handleToggleHistoryCard = (cardId: string) => {
    setCollapsedHistoryCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // History audio player functions
  const handleHistoryAudioPlayPause = (audioId: string) => {
    const historyAudioRef = historyAudioRefs.current[audioId];
    if (!historyAudioRef) return;

    // Pause all other history audios
    Object.keys(historyAudioRefs.current).forEach(id => {
      if (id !== audioId && historyAudioRefs.current[id]) {
        historyAudioRefs.current[id]!.pause();
        setHistoryAudioStates(prev => ({
          ...prev,
          [id]: { ...prev[id], isPlaying: false }
        }));
      }
    });

    if (historyAudioStates[audioId]?.isPlaying) {
      // Pause current history audio
      historyAudioRef.pause();
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], isPlaying: false }
      }));
      
      // Resume main player if it was playing before
      if (mainPlayerWasPlaying) {
        togglePlayPause();
        setMainPlayerWasPlaying(false);
      }
    } else {
      // Play current history audio - pause main player if it's playing
      if (isPlaying) {
        setMainPlayerWasPlaying(true);
        togglePlayPause(); // This will pause the main player
      }
      
      historyAudioRef.play(); // Play the history audio element, not the main one
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], isPlaying: true }
      }));
    }
  };

  const handleHistoryAudioTimeUpdate = (audioId: string) => {
    const audioElement = historyAudioRefs.current[audioId];
    if (audioElement) {
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], currentTime: audioElement.currentTime }
      }));
    }
  };

  const handleHistoryAudioLoadedMetadata = (audioId: string) => {
    const audioElement = historyAudioRefs.current[audioId];
    if (audioElement) {
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], duration: audioElement.duration }
      }));
    }
  };

  const handleHistoryAudioEnded = (audioId: string) => {
    setHistoryAudioStates(prev => ({
      ...prev,
      [audioId]: { ...prev[audioId], isPlaying: false, currentTime: 0 }
    }));
    
    // Resume main player if it was playing before
    if (mainPlayerWasPlaying) {
      togglePlayPause();
      setMainPlayerWasPlaying(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Get history data for the current song
  const getHistoryData = (type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata') => {
    if (!selectedSong?.history) return [];
    
    let historyEntries = selectedSong.history
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // For audio, only show history if the current audio is different from history entries
    if (type === 'audio' && selectedSong.audioFile) {
      historyEntries = historyEntries.filter(entry => entry.content !== selectedSong.audioFile);
    }
    
    return historyEntries;
  };

  // Get latest content (what's shown in main tabs)
  const getLatestContent = (type: 'lyrics' | 'solfas' | 'audio' | 'comments') => {
    if (!selectedSong) return null;
    
    switch (type) {
      case 'lyrics':
        return selectedSong.lyrics;
      case 'solfas':
        return selectedSong.solfas;
      case 'audio':
        return selectedSong.audioFile;
      case 'comments':
        // Get ONLY the latest pastor comment (newest one)
        return selectedSong.comments
          .filter(comment => comment.author === 'Pastor')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      default:
        return null;
    }
  };

  // Get older comments for history (all except the latest)
  const getOlderComments = () => {
    if (!selectedSong) return [];
    
    const pastorComments = selectedSong.comments
      .filter(comment => comment.author === 'Pastor')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Return all except the first one (which is the latest)
    return pastorComments.slice(1);
  };

  // Get older solfas for history (all except the latest)
  const getOlderSolfas = () => {
    if (!selectedSong?.solfas) return [];
    
    // For now, we only have current solfas, but this function is ready for when we have multiple versions
    // In the future, this would work like comments - showing previous versions
    return [];
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [isDragging, setIsDragging] = useState(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  const seekToTime = (newTime: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));
      
      // Ensure the audio is loaded before seeking
      if (audioRef.current.readyState >= 2) {
        audioRef.current.currentTime = clampedTime;
        console.log('🎯 Seeked to:', clampedTime, 'seconds');
      } else {
        // Wait for audio to be ready then seek
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = clampedTime;
            audioRef.current.removeEventListener('canplay', handleCanPlay);
            console.log('🎯 Seeked to (after load):', clampedTime, 'seconds');
          }
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  };

  const getTimeFromMouseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return percentage * duration;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && audioRef.current && duration > 0) {
      const newTime = getTimeFromMouseEvent(e);
      seekToTime(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setWasPlayingBeforeDrag(isPlaying);
    
    // Pause during drag for smoother seeking
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
    
    const newTime = getTimeFromMouseEvent(e);
    seekToTime(newTime);
    console.log('🎯 Started dragging at:', newTime, 'seconds');
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && audioRef.current && duration > 0) {
      const newTime = getTimeFromMouseEvent(e);
      seekToTime(newTime);
    }
  };

  const handleProgressMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Resume playing if it was playing before drag
      if (wasPlayingBeforeDrag && audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error resuming after drag:', error);
        });
      }
      
      console.log('🎯 Finished dragging');
    }
  };

  // Add global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && audioRef.current && duration > 0) {
        // Find the progress bar element
        const progressBar = document.querySelector('.progress-bar') as HTMLElement;
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, clickX / rect.width));
          const newTime = percentage * duration;
          seekToTime(newTime);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Resume playing if it was playing before drag
        if (wasPlayingBeforeDrag && audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error('Error resuming after drag:', error);
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, duration, wasPlayingBeforeDrag]);

  if (!isOpen || !selectedSong) return null;

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Responsive Container */}
      <div className="mx-auto max-w-2xl w-full h-full flex flex-col">
        
        {/* iOS Handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div
            onClick={onClose}
            className="w-8 h-0.5 bg-gray-400 rounded-full cursor-pointer"
          ></div>
        </div>

        {/* Header with Album Art and Song Info - Sticky */}
        <div className="relative bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-white/30 overflow-hidden flex-shrink-0">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/DSC_6155_scaled.jpg')`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)'
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Content with relative positioning */}
          <div className="relative z-10">
          {/* Back Button Row */}
          <div className="flex items-center mb-3">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          
          
          {/* Main Header Row */}
          <div className="flex items-center space-x-4 mb-3">
            {/* Song Info - Center */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-xl font-black text-center mb-4 font-poppins uppercase">{selectedSong.title}</h1>
              <div className="text-white text-sm space-y-1 font-poppins">
                <div className="border-b border-white/30 pb-1">
                  <span className="font-semibold uppercase">LEAD SINGER:</span> {selectedSong?.leadSinger || 'Unknown Artist'}
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  {selectedSong?.writer && (
                    <span><span className="font-semibold uppercase">WRITER:</span> {selectedSong.writer}</span>
                  )}
                  <span className="font-bold">x{(selectedSong?.history?.filter(entry => entry.type === 'metadata').length || 0) + 1}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  {selectedSong?.conductor && (
                    <span><span className="font-semibold uppercase">CONDUCTOR:</span> {selectedSong.conductor}</span>
                  )}
                  {selectedSong?.key && (
                    <span><span className="font-semibold uppercase">KEY:</span> {selectedSong.key}</span>
                  )}
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  {selectedSong?.leadKeyboardist && (
                    <span><span className="font-semibold uppercase">LEAD KEYBOARDIST:</span> {selectedSong.leadKeyboardist}</span>
                  )}
                  {selectedSong?.tempo && (
                    <span><span className="font-semibold uppercase">TEMPO:</span> {selectedSong.tempo}</span>
                  )}
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  {selectedSong?.drummer !== undefined && (
                    <span><span className="font-semibold uppercase">DRUMMER:</span> {selectedSong.drummer}</span>
                  )}
                  {selectedSong?.leadGuitarist !== undefined && (
                    <span><span className="font-semibold uppercase">LEAD GUITARIST:</span> {selectedSong.leadGuitarist}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation inside header */}
          <div className="flex justify-center items-center space-x-8 pt-2">
            <button
              onClick={() => setActiveTab('lyrics')}
              className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'lyrics'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Lyrics</span>
            </button>
            <button
              onClick={() => setActiveTab('solfas')}
              className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'solfas'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              }`}>
                <Music className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Solfas</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'comments'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Comments</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'history'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">History</span>
            </button>
          </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 px-6 py-4 pb-24 overflow-y-auto">
          {activeTab === 'lyrics' && (
            <div className="max-w-none">
              <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                {selectedSong?.lyrics ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedSong.lyrics }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm mb-2">No Lyrics Available</div>
                    <div className="text-gray-400 text-xs">Lyrics will be displayed here when available</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'solfas' && (
            <div className="max-w-none">
              <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                {selectedSong?.solfas ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedSong.solfas }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontStyle: 'italic'
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm mb-2">No Solfas Available</div>
                    <div className="text-gray-400 text-xs">Solfas notation will be displayed here when available</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              {selectedSong?.comments && selectedSong.comments.length > 0 ? (
                // Show only the latest pastor comment in main Comments tab
                selectedSong.comments
                  .filter((comment: any) => comment.author === 'Pastor')
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 1) // Only show the latest one
                  .map((comment: any) => (
                    <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900 text-sm">{comment.author}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(comment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          💡 <strong>Tip:</strong> View all pastor comments in History &gt; Pastor Comments
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm mb-2">No Pastor Comments Yet</div>
                  <div className="text-gray-400 text-xs">Latest pastor comments will appear here</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* History Sub-categories */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveHistoryTab('lyrics')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'lyrics'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Lyrics
                </button>
                <button
                  onClick={() => setActiveHistoryTab('audio')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'audio'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Audio
                </button>
                <button
                  onClick={() => setActiveHistoryTab('solfas')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'solfas'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Solfas
                </button>
                <button
                  onClick={() => setActiveHistoryTab('comments')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'comments'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Pastor Comments
                </button>
                <button
                  onClick={() => setActiveHistoryTab('metadata')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'metadata'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Metadata
                </button>
              </div>

              {/* History Content */}
              <div className="min-h-[200px]">
                {activeHistoryTab === 'lyrics' && (
                  <div className="space-y-3">
                    {/* History entries - all using same design */}
                    {getHistoryData('lyrics').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(entry.date)).date} {formatDateTime(new Date(entry.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show empty state if no history available */}
                    {getHistoryData('lyrics').length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-slate-500 text-sm mb-2">No Lyrics History</div>
                        <div className="text-slate-400 text-xs">Previous lyrics versions will appear here when available</div>
                      </div>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'audio' && (
                  <div className="space-y-3">
                    {/* Show history entries from the history array */}
                    {getHistoryData('audio').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Music className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(entry.date)).date} {formatDateTime(new Date(entry.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleHistoryAudioPlayPause(entry.id)}
                                    className="w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                                  >
                                    {historyAudioStates[entry.id]?.isPlaying ? (
                                      <Pause className="w-5 h-5" />
                                    ) : (
                                      <Play className="w-5 h-5 ml-0.5" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-800">Previous Audio Version</div>
                                    <div className="text-xs text-slate-500 mt-2 bg-slate-100 px-2 py-1 rounded-full inline-block">
                                      {formatTime(historyAudioStates[entry.id]?.currentTime || 0)} / {formatTime(historyAudioStates[entry.id]?.duration || 0)}
                                    </div>
                                  </div>
                                </div>
                                <audio
                                  ref={el => {
                                    if (el) historyAudioRefs.current[entry.id] = el;
                                  }}
                                  src={entry.content}
                                  onTimeUpdate={() => handleHistoryAudioTimeUpdate(entry.id)}
                                  onLoadedMetadata={() => handleHistoryAudioLoadedMetadata(entry.id)}
                                  onEnded={() => handleHistoryAudioEnded(entry.id)}
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show empty state if no history available */}
                    {getHistoryData('audio').length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-slate-500 text-sm mb-2">No Audio History</div>
                        <div className="text-slate-400 text-xs">Previous audio versions will appear here when available</div>
                      </div>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'solfas' && (
                  <div className="space-y-3">
                    {/* Show older solfas versions if any exist */}
                    {getOlderSolfas().length > 0 ? (
                      getOlderSolfas().map((solfas, index) => (
                        <div key={`solfas-${index}`} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <button
                            onClick={() => handleToggleHistoryCard(`solfas-${index}`)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date()).date} {formatDateTime(new Date()).time}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {collapsedHistoryCards.has(`solfas-${index}`) ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>
                          {!collapsedHistoryCards.has(`solfas-${index}`) && (
                            <div className="px-4 pb-4">
                              <div className="text-sm text-slate-700">
                                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                  <div dangerouslySetInnerHTML={{ __html: solfas }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : null}

                    {/* Show history entries from the history array */}
                    {getHistoryData('solfas').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Music className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(entry.date)).date} {formatDateTime(new Date(entry.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show empty state if no history available */}
                    {getOlderSolfas().length === 0 && getHistoryData('solfas').length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-slate-500 text-sm mb-2">No Solfas History</div>
                        <div className="text-slate-400 text-xs">Previous solfas versions will appear here when available</div>
                      </div>
                    )}

                  </div>
                )}

                {activeHistoryTab === 'comments' && (
                  <div className="space-y-3">
                    {/* Show older comments (all except the latest) */}
                    {getOlderComments().map((comment, index) => (
                      <div key={comment.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(comment.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(comment.date)).date} {formatDateTime(new Date(comment.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(comment.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(comment.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <p className="font-medium text-slate-800">{comment.author}</p>
                                <p className="text-sm text-slate-700 mt-2">{comment.text}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Also show history entries from the history array */}
                    {getHistoryData('comments').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(entry.date)).date} {formatDateTime(new Date(entry.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <p className="font-medium text-slate-800">Pastor</p>
                                <p className="text-sm text-slate-700 mt-2">{entry.content}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show empty state if no history available */}
                    {getOlderComments().length === 0 && getHistoryData('comments').length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-slate-500 text-sm mb-2">No Comments History</div>
                        <div className="text-slate-400 text-xs">Previous comments will appear here when available</div>
                      </div>
                    )}

                  </div>
                )}

                {activeHistoryTab === 'metadata' && (
                  <div className="space-y-3">
                    {/* Metadata history entries */}
                    {getHistoryData('metadata').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(new Date(entry.date)).date} {formatDateTime(new Date(entry.date)).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div className="space-y-2">
                                  {entry.content.split(' | ').map((change, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                      <span className="text-sm text-slate-700">{change}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty state for metadata history */}
                    {getHistoryData('metadata').length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-slate-500 text-sm mb-2">No Metadata History</div>
                        <div className="text-slate-400 text-xs">Previous metadata changes will appear here when available</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Music Player - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-4 bg-white border-t border-gray-100 z-50">

          {/* Progress Bar */}
          <div className="mb-2">
            <div 
              className="progress-bar w-full h-1 bg-gray-300 rounded-full relative cursor-pointer hover:h-1.5 transition-all duration-200 select-none"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
            >
              <div 
                className="h-full bg-gray-600 rounded-full relative transition-all duration-200"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-200 ${
                  isDragging ? 'w-4 h-4 bg-blue-600' : 'w-3 h-3 bg-gray-600 hover:w-4 hover:h-4'
                }`}></div>
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600 text-xs">{formatTime(currentTime)}</span>
              <span className="text-gray-600 text-xs">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              {/* Repeat Button */}
              <button
                onClick={toggleRepeat}
                className={`w-6 h-6 flex items-center justify-center transition-colors ${
                  isRepeating ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <RotateCcw className={`w-4 h-4 ${isRepeating ? 'fill-current' : ''}`} />
              </button>

              {/* Previous Track */}
              <button 
                onClick={handlePrevious}
                className="w-6 h-6 flex items-center justify-center hover:text-gray-800 transition-colors"
              >
                <SkipBack className="w-5 h-5 text-gray-600 fill-gray-600" />
              </button>
            </div>

            {/* Center Play/Pause Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎵 Button clicked - Current state:', { 
                  isPlaying, 
                  isLoading, 
                  hasError,
                  audioSrc: audioRef.current?.src,
                  audioReadyState: audioRef.current?.readyState,
                  audioPaused: audioRef.current?.paused
                });
                
                // Pause all history audios first
                Object.keys(historyAudioRefs.current).forEach(id => {
                  if (historyAudioRefs.current[id]) {
                    historyAudioRefs.current[id]!.pause();
                  }
                });
                
                // Direct test - bypass the context for debugging
                if (audioRef.current) {
                  if (audioRef.current.paused) {
                    console.log('🎵 Direct play attempt');
                    audioRef.current.play().then(() => {
                      console.log('✅ Direct play successful');
                    }).catch(error => {
                      console.error('❌ Direct play failed:', error);
                    });
                  } else {
                    console.log('🎵 Direct pause attempt');
                    audioRef.current.pause();
                    console.log('✅ Direct pause successful');
                  }
                } else {
                  console.error('❌ No audioRef.current available');
                }
                
                // Also call the context method
                togglePlayPause();
              }}
              disabled={isLoading || hasError}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm ${
                hasError 
                  ? 'bg-red-500 cursor-not-allowed' 
                  : isLoading 
                    ? 'bg-gray-400 cursor-wait' 
                    : 'bg-gray-600'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : hasError ? (
                <div className="w-4 h-4 text-white text-xs">!</div>
              ) : isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              {/* Next Track */}
              <button 
                onClick={handleNext}
                className="w-6 h-6 flex items-center justify-center hover:text-gray-800 transition-colors"
              >
                <SkipForward className="w-5 h-5 text-gray-600 fill-gray-600" />
              </button>

              {/* Music Page Button */}
              <button
                onClick={handleMusicPage}
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Music2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    </>
  );
}
