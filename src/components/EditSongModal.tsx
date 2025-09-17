"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FolderOpen } from 'lucide-react';
import { PraiseNightSong, Comment, Category } from '../types/supabase';
import MediaSelectionModal from './MediaSelectionModal';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  folder?: string;
  storagePath?: string;
}

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: PraiseNightSong | null;
  categories: Category[];
  praiseNightCategories: Array<{id: number, name: string, description: string, date: string, location: string, icon: string, color: string, isActive: boolean, createdAt: Date, updatedAt: Date, countdown: {days: number, hours: number, minutes: number, seconds: number}}>;
  onUpdate: (updatedSong: PraiseNightSong) => void;
}

export default function EditSongModal({ 
  isOpen, 
  onClose, 
  song, 
  categories, 
  praiseNightCategories,
  onUpdate 
}: EditSongModalProps) {
  // Form state
  const [songTitle, setSongTitle] = useState('');
  const [songCategory, setSongCategory] = useState('');
  const [songPraiseNight, setSongPraiseNight] = useState('');
  const [songStatus, setSongStatus] = useState<'heard' | 'unheard'>('unheard');
  const [songLeadSinger, setSongLeadSinger] = useState('');
  const [songWriter, setSongWriter] = useState('');
  const [songConductor, setSongConductor] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songTempo, setSongTempo] = useState('');
  const [songLeadKeyboardist, setSongLeadKeyboardist] = useState('');
  const [songLeadGuitarist, setSongLeadGuitarist] = useState('');
  const [songDrummer, setSongDrummer] = useState('');
  const [songSolfas, setSongSolfas] = useState('');
  const [songHistory, setSongHistory] = useState('');
  const [songAudioFile, setSongAudioFile] = useState('');
  const [audioFile, setAudioFile] = useState<MediaFile | null>(null);
  const [songLyrics, setSongLyrics] = useState('');
  const [songComments, setSongComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rehearsalCount, setRehearsalCount] = useState(1);
  const [showMediaManager, setShowMediaManager] = useState(false);

  // Handle media file selection from MediaManager
  const handleMediaFileSelect = (mediaFile: any) => {
    console.log('✅ SELECTED AUDIO FILE:', {
      name: mediaFile.name,
      url: mediaFile.url,
      id: mediaFile.id,
      type: mediaFile.type
    });
    
    // Supabase Storage URLs work directly - no CORS issues!
    let fixedUrl = mediaFile.url;
    console.log('✅ USING SUPABASE STORAGE URL:', fixedUrl);
    
    setSongAudioFile(fixedUrl);
    setAudioFile({ ...mediaFile, url: fixedUrl }); // Store with fixed URL
    setShowMediaManager(false);
  };

  // Helper function to convert HTML to plain text
  const htmlToPlainText = (html: string) => {
    if (!html) return '';
    // Create a temporary div to parse HTML and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper function to convert plain text to HTML (preserve line breaks)
  const plainTextToHtml = (text: string) => {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  };

  // Initialize form when song changes
  useEffect(() => {
    if (song) {
      // Editing existing song - populate form with song data
      setSongTitle(song.title || '');
      setSongCategory(song.category || '');
      // Find the praise night name from the praiseNightId
      const praiseNight = praiseNightCategories.find(pn => pn.id === song.praiseNightId);
      setSongPraiseNight(praiseNight?.name || '');
      setSongStatus(song.status);
      setSongLeadSinger(song.leadSinger || '');
      setSongWriter(song.writer || '');
      setSongConductor(song.conductor || '');
      setSongKey(song.key || '');
      setSongTempo(song.tempo || '');
      setSongLeadKeyboardist(song.leadKeyboardist || '');
      setSongLeadGuitarist(song.leadGuitarist || '');
      setSongDrummer(song.drummer || '');
      setSongHistory('');
      setSongAudioFile(song.audioFile || '');
      setAudioFile(null); // Reset file object when editing existing song
      
      // Convert HTML to plain text for editing
      setSongLyrics(htmlToPlainText(song.lyrics || ''));
      setSongSolfas(htmlToPlainText(song.solfas || ''));
      
      setSongComments(song.comments);
      setNewComment('');
      
      // Load rehearsal count from song data, default to 1 if not set
      setRehearsalCount(song.rehearsalCount || 1);
    } else {
      // Adding new song - reset all form fields to empty/default values
      setSongTitle('');
      setSongCategory('');
      // Set default praise night to the first available one
      setSongPraiseNight(praiseNightCategories.length > 0 ? praiseNightCategories[0].name : '');
      setSongStatus('unheard');
      setSongLeadSinger('');
      setSongWriter('');
      setSongConductor('');
      setSongKey('');
      setSongTempo('');
      setSongLeadKeyboardist('');
      setSongLeadGuitarist('');
      setSongDrummer('');
      setSongSolfas('');
      setSongHistory('');
      setSongAudioFile('');
      setAudioFile(null);
      setSongLyrics('');
      setSongComments([]);
      setNewComment('');
      setRehearsalCount(1);
    }
  }, [song, praiseNightCategories]);

  const handleUpdate = () => {
    if (songTitle.trim()) {
      // Find the selected Praise Night ID
      const selectedPraiseNight = praiseNightCategories.find(pn => pn.name === songPraiseNight);
      
      if (!selectedPraiseNight) {
        alert('Please select a valid Praise Night');
        return;
      }

      console.log('💾 SAVING SONG:', {
        songTitle: songTitle,
        hasSelectedAudio: !!audioFile,
        audioURL: audioFile ? audioFile.url : songAudioFile,
        willSaveAudio: !!(audioFile ? audioFile.url : songAudioFile)
      });
      
      const finalAudioFile = audioFile ? audioFile.url : songAudioFile;
      
      const songData: PraiseNightSong = {
        title: songTitle.trim(),
        status: songStatus,
        category: songCategory,
        praiseNightId: selectedPraiseNight?.id,
        lyrics: plainTextToHtml(songLyrics), // Convert plain text to HTML for storage
        leadSinger: songLeadSinger,
        writer: songWriter,
        conductor: songConductor,
        key: songKey,
        tempo: songTempo,
        leadKeyboardist: songLeadKeyboardist,
        leadGuitarist: songLeadGuitarist,
        drummer: songDrummer,
        solfas: plainTextToHtml(songSolfas), // Convert plain text to HTML for storage
        rehearsalCount: rehearsalCount, // Save rehearsal count to database
        comments: songComments,
        audioFile: finalAudioFile,
        mediaId: audioFile ? parseInt(audioFile.id) : undefined, // Store media ID for database relationship (convert string to number)
        // Preserve existing history array
        history: song?.history || []
      };

      console.log('🎵 Final songData being saved:', {
        title: songData.title,
        audioFile: songData.audioFile,
        mediaId: songData.mediaId,
        mediaIdType: typeof songData.mediaId,
        audioFileLength: songData.audioFile?.length,
        originalAudioFileId: audioFile?.id,
        originalAudioFileIdType: typeof audioFile?.id
      });

      // If editing existing song, preserve other properties including history
      let updatedSong = song ? { ...song, ...songData } : songData;

      // If editing existing song, create history entries for changes
      if (song) {
        const newHistoryEntries = [];

        // Rehearsal count is now just a display field - no automatic history entries

        // Check for metadata changes
        if (song.leadSinger !== songLeadSinger ||
            song.writer !== songWriter ||
            song.conductor !== songConductor ||
            song.key !== songKey ||
            song.tempo !== songTempo ||
            song.leadKeyboardist !== songLeadKeyboardist ||
            song.leadGuitarist !== songLeadGuitarist ||
            song.drummer !== songDrummer) {
          
          // Create metadata change description
          const changes = [];
          if (song.leadSinger !== songLeadSinger) changes.push(`Lead Singer: ${song.leadSinger} → ${songLeadSinger}`);
          if (song.writer !== songWriter) changes.push(`Writer: ${song.writer} → ${songWriter}`);
          if (song.conductor !== songConductor) changes.push(`Conductor: ${song.conductor} → ${songConductor}`);
          if (song.key !== songKey) changes.push(`Key: ${song.key} → ${songKey}`);
          if (song.tempo !== songTempo) changes.push(`Tempo: ${song.tempo} → ${songTempo}`);
          if (song.leadKeyboardist !== songLeadKeyboardist) changes.push(`Lead Keyboardist: ${song.leadKeyboardist} → ${songLeadKeyboardist}`);
          if (song.leadGuitarist !== songLeadGuitarist) changes.push(`Lead Guitarist: ${song.leadGuitarist} → ${songLeadGuitarist}`);
          if (song.drummer !== songDrummer) changes.push(`Drummer: ${song.drummer} → ${songDrummer}`);

          // Create metadata history entry
          newHistoryEntries.push({
            id: `metadata-${Date.now()}`,
            type: 'metadata' as const,
            content: changes.join(' | '),
            date: new Date().toISOString(),
            version: (song.history?.filter(entry => entry.type === 'metadata').length || 0) + 1
          });
        }

        // Check for lyrics changes (compare HTML versions)
        const newLyricsHtml = plainTextToHtml(songLyrics);
        if (song.lyrics !== newLyricsHtml) {
          console.log('🎵 Lyrics changed, adding history entry');
          newHistoryEntries.push({
            id: `lyrics-${Date.now()}`,
            type: 'lyrics' as const,
            content: newLyricsHtml,
            date: new Date().toISOString(),
            version: (song.history?.filter(entry => entry.type === 'lyrics').length || 0) + 1
          });
        }

        // Check for solfas changes (compare HTML versions)
        const newSolfasHtml = plainTextToHtml(songSolfas);
        if (song.solfas !== newSolfasHtml) {
          console.log('🎵 Solfas changed, adding history entry');
          newHistoryEntries.push({
            id: `solfas-${Date.now()}`,
            type: 'solfas' as const,
            content: newSolfasHtml,
            date: new Date().toISOString(),
            version: (song.history?.filter(entry => entry.type === 'solfas').length || 0) + 1
          });
        }

        // Check for audio changes
        const newAudioFile = audioFile ? audioFile.url : songAudioFile;
        const oldAudioFile = song.audioFile || '';
        
        console.log('🎵 Checking audio changes:', {
          oldAudioFile,
          newAudioFile,
          hasChanged: oldAudioFile !== newAudioFile
        });
        
        if (oldAudioFile !== newAudioFile) {
          const audioFileName = audioFile ? audioFile.name : (newAudioFile ? newAudioFile.split('/').pop() : 'Unknown');
          newHistoryEntries.push({
            id: `audio-${Date.now()}`,
            type: 'audio' as const,
            content: `Audio changed to: ${audioFileName}`,
            date: new Date().toISOString(),
            version: (song.history?.filter(entry => entry.type === 'audio').length || 0) + 1
          });
          console.log('🎵 Added audio history entry');
        }

        // Check for comments changes (if comments were added/modified)
        if (songComments.length > (song.comments?.length || 0)) {
          const newComments = songComments.slice(song.comments?.length || 0);
          newComments.forEach(comment => {
            newHistoryEntries.push({
              id: `comment-${Date.now()}-${Math.random()}`,
              type: 'comment' as const,
              content: comment.text,
              date: comment.date,
              version: (song.history?.filter(entry => entry.type === 'comment').length || 0) + 1
            });
          });
        }

        // FOR TESTING: Always add a test history entry to verify the system works
        if (newHistoryEntries.length === 0) {
          console.log('🧪 Adding test history entry to verify system works');
          newHistoryEntries.push({
            id: `test-${Date.now()}`,
            type: 'metadata' as const,
            content: `Song edited at ${new Date().toLocaleString()}`,
            date: new Date().toISOString(),
            version: (song.history?.filter(entry => entry.type === 'metadata').length || 0) + 1
          });
        }

        // Add all new history entries
        if (newHistoryEntries.length > 0) {
          console.log('🎵 Adding', newHistoryEntries.length, 'history entries:', newHistoryEntries.map(h => h.type));
          updatedSong = {
            ...updatedSong,
            history: [...(song.history || []), ...newHistoryEntries]
          };
        } else {
          console.log('🎵 No history entries to add');
        }
      }

      console.log('🎵 Final updatedSong with history:', {
        title: updatedSong.title,
        hasHistory: !!updatedSong.history,
        historyCount: updatedSong.history?.length || 0,
        historyTypes: updatedSong.history?.map(h => h.type) || []
      });

      onUpdate(updatedSong);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        date: new Date().toISOString(),
        author: 'Pastor'
      };
      setSongComments([...songComments, comment]);
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setSongComments(songComments.filter(comment => comment.id !== commentId));
  };

  if (!isOpen) return null;

  // Don't render form until song data is properly loaded (for editing mode)
  if (song && !song.title) return null;

  return (
    <>
      <style jsx>{`
        .hide-toolbar {
          display: none !important;
        }
      `}</style>
      
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="bg-white w-full h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-outfit-semibold text-slate-900 truncate">
              {song ? `Edit Song: ${song.title}` : 'Add New Song'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full p-3 sm:p-4 lg:p-6">
              
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  
                  {/* Song Title - Full Width */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Song Information</h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Song Title *
                        </label>
                        <input
                          type="text"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const clipboardData = e.clipboardData || (window as any).clipboardData;
                            const pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
                            const target = e.target as HTMLInputElement;
                            const start = target.selectionStart || 0;
                            const end = target.selectionEnd || 0;
                            const currentValue = songTitle;
                            const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
                            setSongTitle(newValue);
                            // Set cursor position after pasted text
                            setTimeout(() => {
                              target.selectionStart = target.selectionEnd = start + pastedText.length;
                            }, 0);
                          }}
                          dir="ltr"
                          style={{ textAlign: 'left', direction: 'ltr' }}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200 text-lg font-medium"
                          placeholder="Enter song title"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={songCategory}
                            onChange={(e) => setSongCategory(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                          </label>
                          <select
                            value={songStatus}
                            onChange={(e) => setSongStatus(e.target.value as 'heard' | 'unheard')}
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          >
                            <option value="heard">Heard</option>
                            <option value="unheard">Unheard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Praise Night
                        </label>
                        <select
                          value={songPraiseNight}
                          onChange={(e) => setSongPraiseNight(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                        >
                          <option value="">Select Praise Night</option>
                          {praiseNightCategories.map(praiseNight => (
                            <option key={praiseNight.id} value={praiseNight.name}>{praiseNight.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Music Details */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Music Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Key
                        </label>
                        <input
                          type="text"
                          value={songKey}
                          onChange={(e) => setSongKey(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="e.g., C, G, F#"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tempo
                        </label>
                        <input
                          type="text"
                          value={songTempo}
                          onChange={(e) => setSongTempo(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="e.g., 120 BPM"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rehearsal Count (Manual)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={rehearsalCount}
                          onChange={(e) => setRehearsalCount(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter rehearsal count manually"
                        />
                      </div>
                    </div>

                    {/* Audio File - Full Width */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Audio File
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMediaManager(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Browse Media Library
                      </button>
                      {audioFile && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                              <span className="text-sm font-medium text-slate-700 break-all" title={audioFile.name}>
                                {audioFile.name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 ml-4">
                              ({audioFile.size ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` : 'From Media Library'})
                            </span>
                          </div>
                          <audio
                            controls
                            className="w-full h-8"
                            style={{ outline: 'none' }}
                          >
                            <source src={audioFile.url} type="audio/mpeg" />
                            <source src={audioFile.url} type="audio/wav" />
                            <source src={audioFile.url} type="audio/ogg" />
                            <source src={audioFile.url} type="audio/mp4" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {/* Current Audio Display */}
                      <div className="mt-3">
                        {songAudioFile && !audioFile ? (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                <span className="text-sm font-medium text-slate-700">Current Audio:</span>
                              </div>
                              <button
                                onClick={() => {
                                  console.log('🗑️ Deleting audio file:', {
                                    currentSongAudioFile: songAudioFile,
                                    currentAudioFile: audioFile
                                  });
                                  setSongAudioFile('');
                                  setAudioFile(null);
                                  console.log('🗑️ Audio deleted, state cleared');
                                }}
                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-sm text-slate-600 break-all mb-3" title={songAudioFile}>
                              {songAudioFile.split('/').pop() || songAudioFile}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Source: {songAudioFile}
                            </div>
                            <audio
                              controls
                              className="w-full h-8"
                              style={{ outline: 'none' }}
                              preload="metadata"
                            >
                              <source src={songAudioFile} type="audio/mpeg" />
                              <source src={songAudioFile} type="audio/wav" />
                              <source src={songAudioFile} type="audio/ogg" />
                              <source src={songAudioFile} type="audio/mp4" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : !songAudioFile && !audioFile ? (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                            <div className="text-gray-500 text-sm">
                              No audio file selected
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Click "Browse Media Library" to select an audio file
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Personnel */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Personnel</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Singer
                        </label>
                        <input
                          type="text"
                          value={songLeadSinger}
                          onChange={(e) => setSongLeadSinger(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter lead singer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Writer
                        </label>
                        <input
                          type="text"
                          value={songWriter}
                          onChange={(e) => setSongWriter(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter writer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Conductor
                        </label>
                        <input
                          type="text"
                          value={songConductor}
                          onChange={(e) => setSongConductor(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter conductor name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Keyboardist
                        </label>
                        <input
                          type="text"
                          value={songLeadKeyboardist}
                          onChange={(e) => setSongLeadKeyboardist(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter lead keyboardist name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Guitarist
                        </label>
                        <input
                          type="text"
                          value={songLeadGuitarist}
                          onChange={(e) => setSongLeadGuitarist(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter lead guitarist name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Drummer
                        </label>
                        <input
                          type="text"
                          value={songDrummer}
                          onChange={(e) => setSongDrummer(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter drummer name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Lyrics and Comments */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">

                  {/* Lyrics Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Song Lyrics
                      </h4>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Plain Text Editor - No formatting toolbar needed */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Plain text editor - Type your lyrics naturally
                      </div>
                      <div className="hide-toolbar flex flex-wrap items-center gap-1 sm:gap-2 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => document.execCommand('bold')}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('italic')}
                          className="px-3 py-1 text-sm italic bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('underline')}
                          className="px-3 py-1 text-sm underline bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Underline"
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('strikeThrough')}
                          className="px-3 py-1 text-sm line-through bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Strikethrough"
                        >
                          <s>S</s>
                        </button>
                        <div className="w-px h-6 bg-slate-300"></div>
                        <button
                          type="button"
                          onClick={() => document.execCommand('insertUnorderedList')}
                          className="px-3 py-1 text-sm bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('insertOrderedList')}
                          className="px-3 py-1 text-sm bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Numbered List"
                        >
                          1. List
                        </button>
                        <div className="w-px h-6 bg-slate-300"></div>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h1')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 1"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h2')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h3')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 3"
                        >
                          H3
                        </button>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          id="lyrics-editor"
                          value={songLyrics} // Now contains plain text
                          onChange={(e) => setSongLyrics(e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const clipboardData = e.clipboardData || (window as any).clipboardData;
                            const pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
                            const target = e.target as HTMLTextAreaElement;
                            const start = target.selectionStart || 0;
                            const end = target.selectionEnd || 0;
                            const currentValue = songLyrics;
                            const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
                            setSongLyrics(newValue);
                            // Set cursor position after pasted text
                            setTimeout(() => {
                              target.selectionStart = target.selectionEnd = start + pastedText.length;
                            }, 0);
                          }}
                          dir="ltr"
                          style={{ 
                            textAlign: 'left', 
                            direction: 'ltr',
                            minHeight: '400px',
                            resize: 'vertical'
                          }}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200 text-sm leading-relaxed"
                          placeholder="Enter complete song lyrics here...

Example:
Verse 1:
[Your verse lyrics here]

Chorus:
[Your chorus lyrics here]

Verse 2:
[Your verse lyrics here]

Bridge:
[Your bridge lyrics here]"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white px-2 py-1 rounded">
                          {songLyrics.length} characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solfas Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Solfas Notation
                      </h4>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Plain Text Editor - No formatting toolbar needed */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Plain text editor - Type your solfas naturally
                      </div>
                      <div className="hide-toolbar flex flex-wrap items-center gap-1 sm:gap-2 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => document.execCommand('bold')}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('italic')}
                          className="px-3 py-1 text-sm italic bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('underline')}
                          className="px-3 py-1 text-sm underline bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Underline"
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('strikeThrough')}
                          className="px-3 py-1 text-sm line-through bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Strikethrough"
                        >
                          <s>S</s>
                        </button>
                        <div className="w-px h-6 bg-slate-300"></div>
                        <button
                          type="button"
                          onClick={() => document.execCommand('insertUnorderedList')}
                          className="px-3 py-1 text-sm bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('insertOrderedList')}
                          className="px-3 py-1 text-sm bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Numbered List"
                        >
                          1. List
                        </button>
                        <div className="w-px h-6 bg-slate-300"></div>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h1')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 1"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h2')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand('formatBlock', false, 'h3')}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-white border-2 border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Heading 3"
                        >
                          H3
                        </button>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          id="solfas-editor"
                          value={songSolfas} // Now contains plain text
                          onChange={(e) => setSongSolfas(e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const clipboardData = e.clipboardData || (window as any).clipboardData;
                            const pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
                            const target = e.target as HTMLTextAreaElement;
                            const start = target.selectionStart || 0;
                            const end = target.selectionEnd || 0;
                            const currentValue = songSolfas;
                            const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
                            setSongSolfas(newValue);
                            // Set cursor position after pasted text
                            setTimeout(() => {
                              target.selectionStart = target.selectionEnd = start + pastedText.length;
                            }, 0);
                          }}
                          dir="ltr"
                          style={{ 
                            textAlign: 'left', 
                            direction: 'ltr',
                            minHeight: '300px',
                            resize: 'vertical'
                          }}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200 text-sm leading-relaxed font-mono"
                          placeholder="Enter solfas notation here...

Example:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do
Do Ti La Sol Fa Mi Re Do

Chorus:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white px-2 py-1 rounded">
                          {songSolfas.length} characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Pastor Comments
                        <span className="ml-auto text-xs sm:text-sm font-normal text-slate-500 bg-gray-200 px-2 py-1 rounded-full">
                          {songComments.length} comment{songComments.length !== 1 ? 's' : ''}
                        </span>
                      </h4>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      {/* Add new comment */}
                      <div className="mb-6">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onPaste={(e) => {
                                e.preventDefault();
                                const clipboardData = e.clipboardData || (window as any).clipboardData;
                                const pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
                                const target = e.target as HTMLTextAreaElement;
                                const start = target.selectionStart;
                                const end = target.selectionEnd;
                                const currentValue = newComment;
                                const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
                                setNewComment(newValue);
                                // Set cursor position after pasted text
                                setTimeout(() => {
                                  target.selectionStart = target.selectionEnd = start + pastedText.length;
                                }, 0);
                              }}
                              rows={3}
                              dir="ltr"
                              style={{ textAlign: 'left', direction: 'ltr' }}
                              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200 resize-none"
                              placeholder="Add a new comment..."
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <button
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                              className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
                            >
                              Add Comment
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display existing comments */}
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {songComments.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                              <span className="text-slate-400 text-xl">💬</span>
                            </div>
                            <p className="text-sm">No comments yet</p>
                            <p className="text-xs text-slate-400">Add the first comment above</p>
                          </div>
                        ) : (
                          songComments.map((comment) => (
                            <div key={comment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-slate-900 leading-relaxed">{comment.text}</p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1">
                                      <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-purple-600">P</span>
                                      </span>
                                      <span className="text-xs text-slate-600 font-medium">{comment.author}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-500">
                                      {new Date(comment.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-3"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-200 flex-shrink-0">
            <button
              onClick={handleUpdate}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{song ? 'Update Song' : 'Add Song'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <MediaSelectionModal
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onFileSelect={handleMediaFileSelect}
        allowedTypes={['audio']}
        title="Select Audio File"
      />
    </>
  );
}