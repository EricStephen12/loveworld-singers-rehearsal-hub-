"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookOpen, Music, Users, Clock, Play, Pause, SkipBack, SkipForward, RotateCcw, Music2 } from "lucide-react";
import { PraiseNightSong, getCurrentSongs } from "@/data/praise-night-songs";
import { useAudio } from "@/contexts/AudioContext";

interface SongDetailModalProps {
  selectedSong: PraiseNightSong | null;
  isOpen: boolean;
  onClose: () => void;
  onSongChange?: (song: PraiseNightSong) => void;
}

export default function SongDetailModal({ selectedSong, isOpen, onClose, onSongChange }: SongDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'solfas' | 'comments' | 'history'>('lyrics');
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [categorySongs, setCategorySongs] = useState<PraiseNightSong[]>([]);
  
  // Use global audio context
  const { isPlaying, currentTime, duration, togglePlayPause, audioRef } = useAudio();


  const handlePrevious = () => {
    console.log('Previous clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    if (currentSongIndex > 0) {
      const prevSong = categorySongs[currentSongIndex - 1];
      console.log('Previous song:', prevSong);
      if (prevSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex - 1);
        onSongChange(prevSong);
        // Auto-play the previous song
        setTimeout(() => {
          if (audioRef.current && prevSong.audioFile && prevSong.audioFile.trim() !== '') {
            audioRef.current.play().catch((error) => {
              console.error('Error auto-playing previous song:', error);
            });
          }
        }, 100); // Small delay to ensure the new song is loaded
      }
    } else if (audioRef.current) {
      // If at first song in category, go back 10 seconds
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleNext = () => {
    console.log('Next clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    if (currentSongIndex < categorySongs.length - 1) {
      const nextSong = categorySongs[currentSongIndex + 1];
      console.log('Next song:', nextSong);
      if (nextSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex + 1);
        onSongChange(nextSong);
        // Auto-play the next song
        setTimeout(() => {
          if (audioRef.current && nextSong.audioFile && nextSong.audioFile.trim() !== '') {
            audioRef.current.play().catch((error) => {
              console.error('Error auto-playing next song:', error);
            });
          }
        }, 100); // Small delay to ensure the new song is loaded
      }
    } else if (audioRef.current) {
      // If at last song in category, skip forward 10 seconds
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const handleMusicPage = () => {
    // Navigate to music page - you can implement this based on your routing
    console.log('Navigate to music page');
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  useEffect(() => {
    // Load songs from the same category and find current song index
    if (selectedSong) {
      const allSongs = getCurrentSongs();
      const songsInCategory = allSongs.filter(song => song.category === selectedSong.category);
      setCategorySongs(songsInCategory);
      
      const index = songsInCategory.findIndex(song => song.title === selectedSong.title);
      setCurrentSongIndex(index >= 0 ? index : 0);
    }
  }, [selectedSong]);


  if (!isOpen || !selectedSong) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
      {/* Responsive Container */}
      <div className="mx-auto max-w-2xl w-full min-h-full">
        
        {/* iOS Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div
            onClick={onClose}
            className="w-8 h-0.5 bg-gray-400 rounded-full cursor-pointer"
          ></div>
        </div>

        {/* Header with Album Art and Song Info */}
        <div className="relative bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-white/30 overflow-hidden">
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
                {selectedSong?.writer && (
                  <div className="border-b border-white/30 pb-1">
                    <span className="font-semibold uppercase">WRITER:</span> {selectedSong.writer}
                  </div>
                )}
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
        <div className="flex-1 px-6 py-4 pb-24">
          {activeTab === 'lyrics' && (
            <div className="max-w-none">
              <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                {selectedSong?.lyrics ? (
                  <>
                    {selectedSong.lyrics.verse1 && (
                      <>
                        <div className="text-gray-600 text-sm font-medium mb-4 uppercase tracking-wider font-poppins">[Verse 1]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.verse1.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-900 leading-loose italic">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.chorus && (
                      <>
                        <div className="text-gray-600 text-sm font-medium mb-4 mt-8 uppercase tracking-wider font-poppins">[Chorus]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.chorus.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-900 leading-loose font-medium italic">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.verse2 && (
                      <>
                        <div className="text-gray-600 text-sm font-medium mb-4 mt-8 uppercase tracking-wider font-poppins">[Verse 2]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.verse2.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-900 leading-loose italic">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {selectedSong.lyrics.bridge && (
                      <>
                        <div className="text-gray-600 text-sm font-medium mb-4 mt-8 uppercase tracking-wider font-poppins">[Bridge]</div>
                        <div className="space-y-3">
                          {selectedSong.lyrics.bridge.split('\n').map((line: string, index: number) => (
                            <p key={index} className="text-gray-900 leading-loose italic">{line}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </>
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
              <div className="text-gray-900 leading-relaxed space-y-6 text-lg text-center">
                <div className="text-gray-600 text-sm font-medium mb-4 uppercase tracking-wider">[Solfas]</div>
                <div className="space-y-3 font-mono">
                  <p className="text-gray-900 leading-loose">Do Re Mi Fa Sol La Ti Do</p>
                  <p className="text-gray-900 leading-loose">Sol Sol La Ti Do Ti La Sol</p>
                  <p className="text-gray-900 leading-loose">Mi Mi Fa Sol La Sol Fa Mi</p>
                  <p className="text-gray-900 leading-loose">Re Mi Fa Sol La Ti Do Re</p>
                </div>
                
                <div className="text-gray-600 text-sm font-medium mb-4 mt-8 uppercase tracking-wider">[Chorus - Solfas]</div>
                <div className="space-y-3 font-mono">
                  <p className="text-gray-900 leading-loose font-medium">Do Do Re Mi Fa Sol La Ti</p>
                  <p className="text-gray-900 leading-loose font-medium">Ti La Sol Fa Mi Re Do Re</p>
                  <p className="text-gray-900 leading-loose font-medium">Mi Fa Sol La Ti Do Re Mi</p>
                  <p className="text-gray-900 leading-loose font-medium">Fa Sol La Ti Do Ti La Sol</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              {selectedSong?.comments && selectedSong.comments.length > 0 ? (
                selectedSong.comments
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((comment: any) => (
                    <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900 text-sm">{comment.author}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(comment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm mb-2">No Comments Yet</div>
                  <div className="text-gray-400 text-xs">Comments will appear here</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm mb-2">History</div>
              <div className="text-gray-400 text-xs">Song history will be displayed here</div>
            </div>
          )}
        </div>

        {/* Compact Music Player - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-4 bg-white border-t border-gray-100 z-50">

          {/* Progress Bar */}
          <div className="mb-2">
            <div 
              className="w-full h-1 bg-gray-300 rounded-full relative cursor-pointer hover:h-1.5 transition-all duration-200"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gray-600 rounded-full relative transition-all duration-200"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-600 rounded-full hover:w-4 hover:h-4 transition-all duration-200"></div>
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
              onClick={togglePlayPause}
              className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
            >
              {isPlaying ? (
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
  );
}
