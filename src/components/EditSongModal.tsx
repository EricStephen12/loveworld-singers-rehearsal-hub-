"use client";

// Smart Auto-History System - Fixed icon imports
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FolderOpen, Clock, Plus, History } from 'lucide-react';
import { PraiseNightSong, Comment, Category } from '../types/supabase';
import MediaSelectionModal from './MediaSelectionModal';
import BasicTextEditor from './BasicTextEditor';
import { createHistoryEntry, deleteHistoryEntry } from '@/lib/database';

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
  
  // History management state
  const [rehearsalCount, setRehearsalCount] = useState(1);
  const [showMediaManager, setShowMediaManager] = useState(false);
  
  // Smart change detection - track original values
  const [originalValues, setOriginalValues] = useState({
    lyrics: '',
    solfas: '',
    audioFile: '',
    title: '',
    category: '',
    leadSinger: '',
    writer: '',
    conductor: '',
    key: '',
    tempo: ''
  });

  // Manual history creation state
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyType, setHistoryType] = useState<'song-details' | 'personnel' | 'music-details' | 'lyrics' | 'solfas' | 'audio' | 'comments'>('song-details');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyDescription, setHistoryDescription] = useState('');
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [showHistoryList, setShowHistoryList] = useState(false);

  // Manual history creation functions
  const handleCreateHistory = (type: 'song-details' | 'personnel' | 'music-details' | 'lyrics' | 'solfas' | 'audio' | 'comments') => {
    setHistoryType(type);
    
    // Set default title and description based on section
    const sectionNames = {
      'song-details': 'Song Details',
      'personnel': 'Personnel',
      'music-details': 'Music Details',
      'lyrics': 'Lyrics',
      'solfas': 'Solfas',
      'audio': 'Audio',
      'comments': 'Comments'
    };
    
    setHistoryTitle(`${sectionNames[type]} Version ${new Date().toLocaleDateString()}`);
    setHistoryDescription(`Updated ${sectionNames[type].toLowerCase()} on ${new Date().toLocaleString()}`);
    
    setShowHistoryForm(true);
  };

  const handleSaveHistory = async () => {
    if (!song?.id) return;
    
    try {
      // Get current content based on section type
      let currentContent = '';
      let oldValue = '';
      
      switch (historyType) {
        case 'song-details':
          currentContent = JSON.stringify({
            title: songTitle,
            category: songCategory,
            key: songKey,
            tempo: songTempo
          });
          oldValue = JSON.stringify({
            title: originalValues.title,
            category: originalValues.category,
            key: originalValues.key,
            tempo: originalValues.tempo
          });
          break;
        case 'personnel':
          currentContent = JSON.stringify({
            leadSinger: songLeadSinger,
            writer: songWriter,
            conductor: songConductor,
            leadKeyboardist: songLeadKeyboardist,
            leadGuitarist: songLeadGuitarist,
            drummer: songDrummer
          });
          oldValue = JSON.stringify({
            leadSinger: originalValues.leadSinger,
            writer: originalValues.writer,
            conductor: originalValues.conductor,
            leadKeyboardist: originalValues.leadKeyboardist,
            leadGuitarist: originalValues.leadGuitarist,
            drummer: originalValues.drummer
          });
          break;
        case 'music-details':
          currentContent = JSON.stringify({
            key: songKey,
            tempo: songTempo
          });
          oldValue = JSON.stringify({
            key: originalValues.key,
            tempo: originalValues.tempo
          });
          break;
        case 'lyrics':
          currentContent = songLyrics;
          oldValue = originalValues.lyrics;
          break;
        case 'solfas':
          currentContent = songSolfas;
          oldValue = originalValues.solfas;
          break;
        case 'audio':
          currentContent = audioFile ? audioFile.url : songAudioFile;
          oldValue = originalValues.audioFile;
          break;
        case 'comments':
          currentContent = JSON.stringify(songComments);
          oldValue = JSON.stringify(song?.comments || []);
          break;
      }
      
      const success = await createHistoryEntry({
        song_id: song.id,
        title: historyTitle,
        description: historyDescription,
        type: historyType,
        old_value: oldValue,
        new_value: currentContent,
        created_by: 'admin'
      });
      
      if (success) {
        // Reset form but keep it open for multiple entries
        const sectionNames = {
          'song-details': 'Song Details',
          'personnel': 'Personnel',
          'music-details': 'Music Details',
          'lyrics': 'Lyrics',
          'solfas': 'Solfas',
          'audio': 'Audio',
          'comments': 'Comments'
        };
        
        setHistoryTitle(`${sectionNames[historyType]} Version ${new Date().toLocaleDateString()}`);
        setHistoryDescription(`Updated ${sectionNames[historyType].toLowerCase()} on ${new Date().toLocaleString()}`);
        
        // Load updated history entries
        loadHistoryEntries();
        
        // Show success message
        alert('History entry created successfully! You can create another one or close the form.');
      } else {
        alert('Error creating history entry. Please try again.');
      }
    } catch (error) {
      console.error('Error creating history entry:', error);
      alert('Error creating history entry. Please try again.');
    }
  };

  // Load history entries for the current song
  const loadHistoryEntries = async () => {
    if (!song?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('song_history')
        .select('*')
        .eq('song_id', song.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHistoryEntries(data || []);
    } catch (error) {
      console.error('Error loading history entries:', error);
    }
  };

  // Delete history entry
  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('Are you sure you want to delete this history entry?')) return;
    
    try {
      const success = await deleteHistoryEntry(historyId);
      if (success) {
        // Remove from local state
        setHistoryEntries(prev => prev.filter(entry => entry.id !== historyId));
        alert('History entry deleted successfully!');
      } else {
        alert('Error deleting history entry. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting history entry:', error);
      alert('Error deleting history entry. Please try again.');
    }
  };

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

  // Helper function to handle paste events and strip formatting
  const handlePaste = (e: React.ClipboardEvent, currentValue: string, setValue: (value: string) => void) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
    
    // Strip any remaining formatting and normalize whitespace
    const cleanText = pastedText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .trim(); // Remove leading/trailing whitespace
    
    const target = e.target as HTMLInputElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const newValue = currentValue.substring(0, start) + cleanText + currentValue.substring(end);
    setValue(newValue);
    
    // Set cursor position after pasted text
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + cleanText.length;
    }, 0);
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
      
      // Use HTML directly for BasicTextEditor
      setSongLyrics(song.lyrics || '');
      setSongSolfas(song.solfas || '');
      
      setSongComments(song.comments);
      setNewComment('');
      
      // Load rehearsal count from song data, default to 1 if not set
      setRehearsalCount(song.rehearsalCount || 1);
      
      // Store original values for change detection
      setOriginalValues({
        lyrics: song.lyrics || '',
        solfas: song.solfas || '',
        audioFile: song.audioFile || '',
        title: song.title || '',
        category: song.category || '',
        leadSinger: song.leadSinger || '',
        writer: song.writer || '',
        conductor: song.conductor || '',
        key: song.key || '',
        tempo: song.tempo || ''
      });
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
      
      // Reset original values for new song
      setOriginalValues({
        lyrics: '',
        solfas: '',
        audioFile: '',
        title: '',
        category: '',
        leadSinger: '',
        writer: '',
        conductor: '',
        key: '',
        tempo: ''
      });
    }
  }, [song, praiseNightCategories]);

  // Smart change detection function
  const detectSignificantChanges = () => {
    if (!song) {
      console.log('🎯 No song - returning empty changes');
      return []; // No changes for new songs
    }
    
    const changes = [];
    const currentAudioFile = audioFile ? audioFile.url : songAudioFile;
    
    console.log('🎯 Change detection debug:', {
      currentLyrics: songLyrics.trim().substring(0, 50) + '...',
      originalLyrics: originalValues.lyrics.trim().substring(0, 50) + '...',
      lyricsChanged: songLyrics.trim() !== originalValues.lyrics.trim(),
      lyricsLength: songLyrics.trim().length,
      currentSolfas: songSolfas.trim().substring(0, 50) + '...',
      originalSolfas: originalValues.solfas.trim().substring(0, 50) + '...',
      solfasChanged: songSolfas.trim() !== originalValues.solfas.trim(),
      solfasLength: songSolfas.trim().length
    });
    
    // Check for significant changes (ignore minor whitespace/formatting changes)
    if (songLyrics.trim() !== originalValues.lyrics.trim() && 
        songLyrics.trim().length > 10) {
      changes.push('lyrics');
      console.log('🎯 Lyrics change detected');
    }
    
    if (songSolfas.trim() !== originalValues.solfas.trim() && 
        songSolfas.trim().length > 5) {
      changes.push('solfas');
      console.log('🎯 Solfas change detected');
    }
    
    if (currentAudioFile !== originalValues.audioFile && 
        currentAudioFile && 
        originalValues.audioFile) {
      changes.push('audio');
      console.log('🎯 Audio change detected');
    }
    
    // Check metadata changes (only if significant)
    if (songTitle.trim() !== originalValues.title.trim() && 
        songTitle.trim().length > 2) {
      changes.push('metadata');
      console.log('🎯 Metadata change detected');
    }
    
    console.log('🎯 Final detected changes:', changes);
    return changes;
  };

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
        lyrics: songLyrics, // BasicTextEditor provides HTML
        leadSinger: songLeadSinger,
        writer: songWriter,
        conductor: songConductor,
        key: songKey,
        tempo: songTempo,
        leadKeyboardist: songLeadKeyboardist,
        leadGuitarist: songLeadGuitarist,
        drummer: songDrummer,
        solfas: songSolfas, // BasicTextEditor provides HTML
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

      console.log('🎵 Final updatedSong with history:', {
        title: updatedSong.title,
        hasHistory: !!updatedSong.history,
        historyCount: updatedSong.history?.length || 0,
        historyTypes: updatedSong.history?.map(h => h.type) || []
      });

      // Pass the song ID if editing an existing song
      if (song && song.id) {
        onUpdate({ ...updatedSong, id: song.id });
      } else {
        onUpdate(updatedSong);
      }
      
      // Manual history creation - no automatic history
      if (false && significantChanges.length > 0 && song?.id) {
        console.log('🎯 Creating automatic history entries for:', significantChanges);
        
        // Create history entries for each significant change (in background)
        significantChanges.forEach(async (changeType) => {
          try {
            let content = '';
            let version = '1.0';

            switch (changeType) {
              case 'lyrics':
                content = songLyrics;
                break;
              case 'solfas':
                content = songSolfas;
                break;
              case 'audio':
                content = audioFile ? audioFile.url : songAudioFile;
                break;
              case 'metadata':
                content = JSON.stringify({
                  title: songTitle,
                  category: songCategory,
                  leadSinger: songLeadSinger,
                  writer: songWriter,
                  conductor: songConductor,
                  key: songKey,
                  tempo: songTempo
                });
                break;
            }

            if (content.trim()) {
              await createHistoryEntry({
                songId: song.id,
                type: changeType,
                content: content,
            date: new Date().toISOString(),
                version: version
              });
              console.log(`✅ Auto-created history entry for ${changeType}`);
            }
          } catch (error) {
            console.error(`❌ Error creating auto history entry for ${changeType}:`, error);
          }
        });
        } else {
        console.log('🎵 No significant changes detected - no history entries created');
      }
      
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
      
      <div className="fixed inset-0 bg-white z-50 flex flex-col w-screen h-screen">
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
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Song Details</h4>
                      <button
                        onClick={() => handleCreateHistory('song-details')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Song Title *
                        </label>
                        <input
                          type="text"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          onPaste={(e) => handlePaste(e, songTitle, setSongTitle)}
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
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Music Details</h4>
                      <button
                        onClick={() => handleCreateHistory('music-details')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Key
                        </label>
                        <input
                          type="text"
                          value={songKey}
                          onChange={(e) => setSongKey(e.target.value)}
                          onPaste={(e) => handlePaste(e, songKey, setSongKey)}
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
                          onPaste={(e) => handlePaste(e, songTempo, setSongTempo)}
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
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                        Audio File
                      </label>
                        <button
                          onClick={() => handleCreateHistory('audio')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
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
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Personnel</h4>
                      <button
                        onClick={() => handleCreateHistory('personnel')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Singer
                        </label>
                        <input
                          type="text"
                          value={songLeadSinger}
                          onChange={(e) => setSongLeadSinger(e.target.value)}
                          onPaste={(e) => handlePaste(e, songLeadSinger, setSongLeadSinger)}
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
                          onPaste={(e) => handlePaste(e, songWriter, setSongWriter)}
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
                          onPaste={(e) => handlePaste(e, songConductor, setSongConductor)}
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
                          onPaste={(e) => handlePaste(e, songLeadKeyboardist, setSongLeadKeyboardist)}
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
                          onPaste={(e) => handlePaste(e, songLeadGuitarist, setSongLeadGuitarist)}
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
                          onPaste={(e) => handlePaste(e, songDrummer, setSongDrummer)}
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
                      <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Song Lyrics
                      </h4>
                        <button
                          onClick={() => handleCreateHistory('lyrics')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Rich Text Editor with formatting toolbar */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Rich text editor - Use the toolbar above to format your lyrics
                      </div>
                      
                      <div className="relative">
                        <BasicTextEditor
                          id="lyrics-editor"
                          value={songLyrics}
                          onChange={setSongLyrics}
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
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Solfas Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Solfas Notation
                      </h4>
                        <button
                          onClick={() => handleCreateHistory('solfas')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors"
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Rich Text Editor with formatting toolbar */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Rich text editor - Use the toolbar above to format your solfas
                      </div>
                      
                      <div className="relative">
                        <BasicTextEditor
                          id="solfas-editor"
                          value={songSolfas}
                          onChange={setSongSolfas}
                          placeholder="Enter solfas notation here...

Example:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do
Do Ti La Sol Fa Mi Re Do

Chorus:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do"
                          className="w-full font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Pastor Comments
                        <span className="ml-auto text-xs sm:text-sm font-normal text-slate-500 bg-gray-200 px-2 py-1 rounded-full">
                          {songComments.length} comment{songComments.length !== 1 ? 's' : ''}
                        </span>
                      </h4>
                        <button
                          onClick={() => handleCreateHistory('comments')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      {/* Add new comment */}
                      <div className="mb-6">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onPaste={(e) => handlePaste(e, newComment, setNewComment)}
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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  loadHistoryEntries();
                  setShowHistoryList(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium relative"
              >
                <History className="w-4 h-4" />
                <span className="text-sm sm:text-base">View History</span>
                {historyEntries.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {historyEntries.length}
                  </span>
                )}
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
      </div>

      <MediaSelectionModal
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onFileSelect={handleMediaFileSelect}
        allowedTypes={['audio']}
        title="Select Audio File"
      />

      {/* Simple History Creation Modal */}
      {showHistoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Save {historyType.charAt(0).toUpperCase() + historyType.slice(1)} Version
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Create a history entry for the current {historyType} content
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Version Title
                </label>
                <input
                  type="text"
                  value={historyTitle}
                  onChange={(e) => setHistoryTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lyrics Version 1.2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={historyDescription}
                  onChange={(e) => setHistoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="What changed in this version?"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current {historyType} content will be saved as a new version.</strong>
                  <br />
                  You can create multiple versions and switch between them later.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setShowHistoryForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveHistory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save Version
                </button>
                <button
                  onClick={() => {
                    handleSaveHistory();
                    setShowHistoryForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List Modal */}
      {showHistoryList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Song History - {song?.title}
                </h3>
                <button
                  onClick={() => setShowHistoryList(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {historyEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No history entries found for this song.</p>
                  <p className="text-sm">Create your first history entry using the "Add History" buttons.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyEntries.map((entry) => (
                    <div key={entry.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {entry.type}
                            </span>
                            <span className="text-sm text-slate-500">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{entry.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                          <div className="text-xs text-slate-500">
                            Created by: {entry.created_by}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHistory(entry.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete history entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowHistoryList(false)}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}