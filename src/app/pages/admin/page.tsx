'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, Clock, BookOpen, User, Mic, Timer, Settings,
  Plus, Trash2, Search, Edit, Save, X, Check, Play, Pause
} from 'lucide-react';
import { getSongs, updateSong, addSong, deleteSong, type Song } from '@/data/songs';

// Get initial songs from the data module
const initialSongs = getSongs();

export default function AdminPage() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRemarkText, setNewRemarkText] = useState<{[key: number]: string}>({});
  const [newPhaseNames, setNewPhaseNames] = useState<{[key: number]: string}>({});
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [nowPlaying, setNowPlaying] = useState<{url: string | null, isPlaying: boolean}>({url: null, isPlaying: false});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayPause = (url: string) => {
    if (nowPlaying.url === url) {
      // Toggle play/pause for currently playing audio
      if (nowPlaying.isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setNowPlaying(prev => ({...prev, isPlaying: !prev.isPlaying}));
    } else {
      // Stop current audio and play new one
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Create new audio element
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => setNowPlaying({url, isPlaying: true});
      audio.onpause = () => setNowPlaying(prev => prev.url === url ? {...prev, isPlaying: false} : prev);
      audio.onended = () => setNowPlaying({url: null, isPlaying: false});
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setNowPlaying({url: null, isPlaying: false});
      });
    }
  };

  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '',
    writer: '',
    leadSinger: '',
    page: undefined,
    section: '',
    status: 'NOT_HEARD',
    duration: '',
    key: '',
    rehearsals: { count: 0, extra: 0 },
    remarks: [],
    audioLinks: { phases: [] },
    lyrics: { start: '', continue: '' }
  });

  const refreshSongs = () => {
    // Get the latest data from the songs module
    setSongs([...initialSongs]);
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.writer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.leadSinger?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewSong = () => {
    if (!newSong.title) return;
    
    const songToAdd: Song = {
      sn: Math.max(...songs.map(s => s.sn)) + 1,
      title: newSong.title || '',
      writer: newSong.writer || '',
      leadSinger: newSong.leadSinger || '',
      page: newSong.page,
      section: newSong.section || '',
      status: newSong.status as 'HEARD' | 'NOT_HEARD' || 'NOT_HEARD',
      duration: newSong.duration || '',
      key: newSong.key || '',
      rehearsals: newSong.rehearsals || { count: 0, extra: 0 },
      remarks: newSong.remarks || [],
      audioLinks: newSong.audioLinks || { phases: [] },
      lyrics: newSong.lyrics || { start: '', continue: '' }
    };

    addSong(songToAdd);
    refreshSongs();
    setNewSong({
      title: '',
      writer: '',
      leadSinger: '',
      page: undefined,
      section: '',
      status: 'NOT_HEARD',
      duration: '',
      key: '',
      rehearsals: { count: 0, extra: 0 },
      remarks: [],
      audioLinks: { phases: [] },
      lyrics: { start: '', continue: '' }
    });
    setShowAddForm(false);
  };

  const addRemark = (songSn: number) => {
    const text = newRemarkText[songSn] || '';

    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const newRemark = {
      date: new Date().toLocaleDateString(),
      text: text.trim() || 'New remark'
    };

    const updatedSong = updateSong(songSn, {
      remarks: [...(song.remarks || []), newRemark]
    });
    
    if (updatedSong) {
      // Update local state immediately
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
    setNewRemarkText({...newRemarkText, [songSn]: ''});
  };

  const updateRemark = (songSn: number, index: number, text: string) => {
    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const updatedRemarks = [...(song.remarks || [])];
    updatedRemarks[index] = { ...updatedRemarks[index], text };

    const updatedSong = updateSong(songSn, { remarks: updatedRemarks });
    
    if (updatedSong) {
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
  };

  const deleteRemark = (songSn: number, index: number) => {
    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const updatedRemarks = song.remarks?.filter((_, i) => i !== index) || [];
    const updatedSong = updateSong(songSn, { remarks: updatedRemarks });
    
    if (updatedSong) {
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
  };

  const addPhase = (songSn: number) => {
    const phaseName = newPhaseNames[songSn] || '';

    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const newPhase = {
      name: phaseName.trim() || 'New Phase',
      fullMix: '',
      soprano: '',
      tenor: '',
      alto: '',
      instrumentation: ''
    };

    const currentPhases = song.audioLinks?.phases || [];
    const updatedSong = updateSong(songSn, {
      audioLinks: { phases: [...currentPhases, newPhase] }
    });
    
    if (updatedSong) {
      // Update local state immediately
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
    setNewPhaseNames({...newPhaseNames, [songSn]: ''});
  };

  const updatePhase = (songSn: number, phaseIndex: number, field: string, value: string) => {
    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const updatedPhases = [...(song.audioLinks?.phases || [])];
    updatedPhases[phaseIndex] = { ...updatedPhases[phaseIndex], [field]: value };

    const updatedSong = updateSong(songSn, {
      audioLinks: { phases: updatedPhases }
    });
    
    if (updatedSong) {
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
  };

  const deletePhase = (songSn: number, phaseIndex: number) => {
    const song = songs.find(s => s.sn === songSn);
    if (!song) return;

    const updatedPhases = song.audioLinks?.phases?.filter((_, i) => i !== phaseIndex) || [];
    const updatedSong = updateSong(songSn, {
      audioLinks: { phases: updatedPhases }
    });
    
    if (updatedSong) {
      setSongs(prevSongs => 
        prevSongs.map(s => s.sn === songSn ? updatedSong : s)
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">Manage Praise Night Songs & Content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">

        {/* Search and Add Song */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg">Songs Management</span>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm py-2">
                <Plus className="w-4 h-4 mr-2" />
                <span>Add New Song</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search songs, writers, lead singers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-3 text-sm placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Songs List */}
        <div className="space-y-6">
          {filteredSongs.map((song) => (
            <Card key={song.sn} className="border-l-4 border-l-purple-400 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-purple-50">
                <CardTitle className="flex flex-col gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                      {song.sn}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Input 
                        value={song.title}
                        onChange={(e) => {
                          updateSong(song.sn, { title: e.target.value });
                          refreshSongs();
                        }}
                        className="text-base sm:text-xl font-bold border-none p-0 h-auto bg-transparent"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <User size={12} />
                            Writer
                          </label>
                          <Input 
                            value={song.writer || ''}
                            onChange={(e) => {
                              updateSong(song.sn, { writer: e.target.value });
                              refreshSongs();
                            }}
                            placeholder="Writer name"
                            className="text-sm border border-slate-200 px-2 py-1 rounded w-full placeholder:text-slate-400"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Mic size={12} />
                            Lead Singer
                          </label>
                          <Input 
                            value={song.leadSinger || ''}
                            onChange={(e) => {
                              updateSong(song.sn, { leadSinger: e.target.value });
                              refreshSongs();
                            }}
                            placeholder="Singer name"
                            className="text-sm border border-slate-200 px-2 py-1 rounded w-full placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-600">Status</label>
                      <select 
                        value={song.status}
                        onChange={(e) => {
                          updateSong(song.sn, { status: e.target.value as 'HEARD' | 'NOT_HEARD' });
                          refreshSongs();
                        }}
                        className="px-3 py-2 rounded-lg text-sm border w-full"
                      >
                        <option value="NOT_HEARD">NOT HEARD</option>
                        <option value="HEARD">HEARD</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-600">Rehearsals</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium">Count</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newCount = Math.max(0, (song.rehearsals?.count || 0) - 1);
                                updateSong(song.sn, { 
                                  rehearsals: { 
                                    count: newCount, 
                                    extra: song.rehearsals?.extra || 0 
                                  }
                                });
                                refreshSongs();
                              }}
                              className="h-8 w-8 p-0 text-sm"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium text-sm bg-slate-100 py-1 rounded">{song.rehearsals?.count || 0}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newCount = (song.rehearsals?.count || 0) + 1;
                                updateSong(song.sn, { 
                                  rehearsals: { 
                                    count: newCount, 
                                    extra: song.rehearsals?.extra || 0 
                                  }
                                });
                                refreshSongs();
                              }}
                              className="h-8 w-8 p-0 text-sm"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium">Extra</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newExtra = Math.max(0, (song.rehearsals?.extra || 0) - 1);
                                updateSong(song.sn, { 
                                  rehearsals: { 
                                    count: song.rehearsals?.count || 0, 
                                    extra: newExtra 
                                  }
                                });
                                refreshSongs();
                              }}
                              className="h-8 w-8 p-0 text-sm"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium text-sm bg-slate-100 py-1 rounded">{song.rehearsals?.extra || 0}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newExtra = (song.rehearsals?.extra || 0) + 1;
                                updateSong(song.sn, { 
                                  rehearsals: { 
                                    count: song.rehearsals?.count || 0, 
                                    extra: newExtra 
                                  }
                                });
                                refreshSongs();
                              }}
                              className="h-8 w-8 p-0 text-sm"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual Progress */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {Array.from({ length: Math.min(song.rehearsals?.count || 0, 6) }, (_, i) => (
                        <span key={i} className="text-green-600 text-lg">✅</span>
                      ))}
                      {Array.from({ length: Math.max(0, 6 - (song.rehearsals?.count || 0)) }, (_, i) => (
                        <span key={i} className="text-gray-300 text-lg">⬜</span>
                      ))}
                      {(song.rehearsals?.extra || 0) > 0 && (
                        <span className="text-purple-600 text-sm ml-2 font-bold">+{song.rehearsals?.extra}</span>
                      )}
                    </div>
                  </div>
                </CardTitle>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <BookOpen size={12} className="text-blue-500" />
                      Page Number
                    </label>
                    <Input 
                      type="number"
                      value={song.page || ''}
                      onChange={(e) => {
                        updateSong(song.sn, { page: e.target.value ? parseInt(e.target.value) : undefined });
                        refreshSongs();
                      }}
                      placeholder="Page"
                      className="w-20 h-8 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Timer size={12} className="text-green-500" />
                      Duration
                    </label>
                    <Input 
                      value={song.duration || ''}
                      onChange={(e) => {
                        updateSong(song.sn, { duration: e.target.value });
                        refreshSongs();
                      }}
                      placeholder="5:30"
                      className="w-24 h-8 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Music size={12} className="text-purple-500" />
                      Key
                    </label>
                    <Input 
                      value={song.key || ''}
                      onChange={(e) => {
                        updateSong(song.sn, { key: e.target.value });
                        refreshSongs();
                      }}
                      placeholder="C → D"
                      className="w-20 h-8 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">
                      Section
                    </label>
                    <Input 
                      value={song.section || ''}
                      onChange={(e) => {
                        updateSong(song.sn, { section: e.target.value });
                        refreshSongs();
                      }}
                      placeholder="New Songs"
                      className="h-8 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <Tabs defaultValue="remarks" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                    <TabsTrigger value="remarks" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                      Pastor Remarks
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="lyrics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                      Lyrics
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="remarks" className="mt-6 space-y-4">
                    {/* Add new remark */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new pastor remark..."
                        value={newRemarkText[song.sn] || ''}
                        onChange={(e) => setNewRemarkText({...newRemarkText, [song.sn]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addRemark(song.sn)}
                        className="placeholder:text-slate-400"
                      />
                      <Button onClick={() => addRemark(song.sn)} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Existing remarks */}
                    <div className="space-y-3">
                      {song.remarks?.length ? song.remarks.map((remark, i) => (
                        <div key={i} className="border-l-4 border-l-purple-400 bg-purple-50 p-4 rounded-r-lg group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-xs font-medium text-purple-700 mb-1">{remark.date}</div>
                              <Textarea
                                value={remark.text}
                                onChange={(e) => updateRemark(song.sn, i, e.target.value)}
                                className="text-sm bg-transparent border-none p-0 resize-none"
                                rows={2}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRemark(song.sn, i)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-center py-4">No pastor remarks yet</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audio" className="mt-6 space-y-4">
                    {/* Add new phase */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new audio phase name..."
                        value={newPhaseNames[song.sn] || ''}
                        onChange={(e) => setNewPhaseNames({...newPhaseNames, [song.sn]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addPhase(song.sn)}
                        className="placeholder:text-slate-400"
                      />
                      <Button onClick={() => addPhase(song.sn)} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Existing phases */}
                    <div className="space-y-4">
                      {song.audioLinks?.phases?.length ? song.audioLinks.phases.map((phase, i) => (
                        <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <Input
                              value={phase.name}
                              onChange={(e) => updatePhase(song.sn, i, 'name', e.target.value)}
                              className="font-semibold text-blue-800 bg-transparent border-none p-0"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePhase(song.sn, i)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                              ['fullMix', 'Full Mix', 'bg-green-100'],
                              ['soprano', 'Soprano', 'bg-pink-100'],
                              ['tenor', 'Tenor', 'bg-blue-100'],
                              ['alto', 'Alto', 'bg-purple-100'],
                              ['instrumentation', 'Instrumentation', 'bg-orange-100']
                            ].map(([field, label, colorClass]) => (
                              <div key={field} className={`p-3 rounded-lg ${colorClass}`}>
                                <div className="font-medium text-xs uppercase tracking-wide mb-2">{label}</div>
                                <div className="space-y-2">
                                  {phase[field as keyof typeof phase] ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (phase[field as keyof typeof phase]) {
                                              togglePlayPause(phase[field as keyof typeof phase] as string);
                                            }
                                          }}
                                          className="h-6 w-6 p-0 hover:bg-blue-100"
                                        >
                                          {nowPlaying.url === phase[field as keyof typeof phase] && nowPlaying.isPlaying ? 
                                            <Pause className="w-3 h-3 text-blue-600" /> : 
                                            <Play className="w-3 h-3 text-blue-600" />}
                                        </Button>
                                        <div className="text-xs truncate flex-1 bg-white/50 rounded px-2 py-1">
                                          {typeof phase[field as keyof typeof phase] === 'string' && 
                                           (phase[field as keyof typeof phase] as string).includes('.') ? 
                                           (phase[field as keyof typeof phase] as string).split('/').pop() : 
                                           'Audio file'}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updatePhase(song.sn, i, field, '')}
                                        className="h-6 w-6 p-0 hover:bg-red-100"
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    </div>
                                  ) : null}
                                  <label className="block">
                                    <input
                                      type="file"
                                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const uploadKey = `${song.sn}-${i}-${field}`;
                                          setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
                                          
                                          try {
                                            // Create a URL for the uploaded file
                                            const fileUrl = URL.createObjectURL(file);
                                            
                                            // Store file info (in real app, upload to server/cloud storage)
                                            const fileInfo = {
                                              name: file.name,
                                              size: file.size,
                                              type: file.type,
                                              url: fileUrl,
                                              uploadDate: new Date().toISOString()
                                            };
                                            
                                            // Update the phase with file URL
                                            updatePhase(song.sn, i, field, fileUrl);
                                            
                                            // Store file metadata (you can expand this)
                                            console.log('Uploaded file:', fileInfo);
                                            
                                          } catch (error) {
                                            console.error('File upload error:', error);
                                            alert('Failed to upload file. Please try again.');
                                          } finally {
                                            setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div className="cursor-pointer bg-white/70 hover:bg-white border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-3 text-center transition-colors">
                                      {uploadingFiles[`${song.sn}-${i}-${field}`] ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                          <div className="text-xs text-blue-600">Uploading...</div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="text-lg">🎵</div>
                                          <div className="text-xs text-slate-600">
                                            {phase[field as keyof typeof phase] ? 'Replace Audio' : 'Upload Audio'}
                                          </div>
                                          <div className="text-xs text-slate-400">MP3, WAV, M4A</div>
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-center py-4">No audio phases yet</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="lyrics" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Start Lyrics
                        </div>
                        <Textarea
                          value={song.lyrics?.start || ''}
                          onChange={(e) => {
                            updateSong(song.sn, {
                              lyrics: { 
                                start: e.target.value, 
                                continue: song.lyrics?.continue || '' 
                              }
                            });
                            refreshSongs();
                          }}
                          placeholder="Enter start lyrics..."
                          className="min-h-32 bg-transparent border-none p-0 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                        <div className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          Continue Lyrics
                        </div>
                        <Textarea
                          value={song.lyrics?.continue || ''}
                          onChange={(e) => {
                            updateSong(song.sn, {
                              lyrics: { 
                                start: song.lyrics?.start || '', 
                                continue: e.target.value 
                              }
                            });
                            refreshSongs();
                          }}
                          placeholder="Enter continuation lyrics..."
                          className="min-h-32 bg-transparent border-none p-0 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Song Form */}
        {showAddForm && (
          <Card className="border-l-4 border-l-green-400 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-green-700">Add New Song</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Song Title *</label>
                  <Input
                    placeholder="Enter song title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <User size={12} />
                    Writer
                  </label>
                  <Input
                    placeholder="Writer name"
                    value={newSong.writer}
                    onChange={(e) => setNewSong({...newSong, writer: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Mic size={12} />
                    Lead Singer
                  </label>
                  <Input
                    placeholder="Singer name"
                    value={newSong.leadSinger}
                    onChange={(e) => setNewSong({...newSong, leadSinger: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Section</label>
                  <Input
                    placeholder="New Songs"
                    value={newSong.section}
                    onChange={(e) => setNewSong({...newSong, section: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <BookOpen size={12} className="text-blue-500" />
                    Page Number
                  </label>
                  <Input
                    type="number"
                    placeholder="Page"
                    value={newSong.page || ''}
                    onChange={(e) => setNewSong({...newSong, page: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Timer size={12} className="text-green-500" />
                    Duration
                  </label>
                  <Input
                    placeholder="5:30"
                    value={newSong.duration}
                    onChange={(e) => setNewSong({...newSong, duration: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Music size={12} className="text-purple-500" />
                    Key
                  </label>
                  <Input
                    placeholder="C → D"
                    value={newSong.key}
                    onChange={(e) => setNewSong({...newSong, key: e.target.value})}
                    className="placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <select
                    value={newSong.status}
                    onChange={(e) => setNewSong({...newSong, status: e.target.value as 'HEARD' | 'NOT_HEARD'})}
                    className="px-3 py-2 border rounded h-10"
                  >
                    <option value="NOT_HEARD">NOT HEARD</option>
                    <option value="HEARD">HEARD</option>
                  </select>
                </div>
              </div>

              {/* Rehearsal Tracking */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Rehearsal Tracking
                </h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Rehearsals:</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newCount = Math.max(0, (newSong.rehearsals?.count || 0) - 1);
                        setNewSong({
                          ...newSong,
                          rehearsals: { ...newSong.rehearsals, count: newCount, extra: newSong.rehearsals?.extra || 0 }
                        });
                      }}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-bold">{newSong.rehearsals?.count || 0}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newCount = (newSong.rehearsals?.count || 0) + 1;
                        setNewSong({
                          ...newSong,
                          rehearsals: { ...newSong.rehearsals, count: newCount, extra: newSong.rehearsals?.extra || 0 }
                        });
                      }}
                    >
                      +
                    </Button>
                    <span className="ml-4">Extra:</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newExtra = Math.max(0, (newSong.rehearsals?.extra || 0) - 1);
                        setNewSong({
                          ...newSong,
                          rehearsals: { ...newSong.rehearsals, count: newSong.rehearsals?.count || 0, extra: newExtra }
                        });
                      }}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-bold text-purple-600">{newSong.rehearsals?.extra || 0}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newExtra = (newSong.rehearsals?.extra || 0) + 1;
                        setNewSong({
                          ...newSong,
                          rehearsals: { ...newSong.rehearsals, count: newSong.rehearsals?.count || 0, extra: newExtra }
                        });
                      }}
                    >
                      +
                    </Button>
                  </div>
                  
                  {/* Visual tick marks */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(newSong.rehearsals?.count || 0, 6) }, (_, i) => (
                      <span key={i} className="text-green-600 text-sm">✅</span>
                    ))}
                    {Array.from({ length: Math.max(0, 6 - (newSong.rehearsals?.count || 0)) }, (_, i) => (
                      <span key={i} className="text-gray-300 text-sm">⬜</span>
                    ))}
                    {(newSong.rehearsals?.extra || 0) > 0 && (
                      <span className="text-purple-600 text-sm ml-1">+{newSong.rehearsals?.extra}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs for Pastor Remarks, Audio, and Lyrics */}
              <Tabs defaultValue="remarks" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                  <TabsTrigger value="remarks" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    Pastor Remarks
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="lyrics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Lyrics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="remarks" className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new pastor remark..."
                      value={newRemarkText[-1] || ''}
                      onChange={(e) => setNewRemarkText({...newRemarkText, [-1]: e.target.value})}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newRemarkText[-1]?.trim()) {
                          const newRemark = {
                            date: new Date().toLocaleDateString(),
                            text: newRemarkText[-1].trim()
                          };
                          setNewSong({
                            ...newSong,
                            remarks: [...(newSong.remarks || []), newRemark]
                          });
                          setNewRemarkText({...newRemarkText, [-1]: ''});
                        }
                      }}
                      className="placeholder:text-slate-400"
                    />
                    <Button 
                      onClick={() => {
                        if (newRemarkText[-1]?.trim()) {
                          const newRemark = {
                            date: new Date().toLocaleDateString(),
                            text: newRemarkText[-1].trim()
                          };
                          setNewSong({
                            ...newSong,
                            remarks: [...(newSong.remarks || []), newRemark]
                          });
                          setNewRemarkText({...newRemarkText, [-1]: ''});
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {newSong.remarks?.length ? newSong.remarks.map((remark, i) => (
                      <div key={i} className="border-l-4 border-l-purple-400 bg-purple-50 p-4 rounded-r-lg group">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-purple-700 mb-1">{remark.date}</div>
                            <Textarea
                              value={remark.text}
                              onChange={(e) => {
                                const updatedRemarks = [...(newSong.remarks || [])];
                                updatedRemarks[i] = { ...updatedRemarks[i], text: e.target.value };
                                setNewSong({...newSong, remarks: updatedRemarks});
                              }}
                              className="text-sm bg-transparent border-none p-0 resize-none"
                              rows={2}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedRemarks = newSong.remarks?.filter((_, idx) => idx !== i) || [];
                              setNewSong({...newSong, remarks: updatedRemarks});
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-500 text-center py-4">No pastor remarks yet</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="audio" className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new audio phase name..."
                      value={newPhaseNames[-1] || ''}
                      onChange={(e) => setNewPhaseNames({...newPhaseNames, [-1]: e.target.value})}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newPhaseNames[-1]?.trim()) {
                          const newPhase = {
                            name: newPhaseNames[-1].trim(),
                            fullMix: '',
                            soprano: '',
                            tenor: '',
                            alto: '',
                            instrumentation: ''
                          };
                          setNewSong({
                            ...newSong,
                            audioLinks: {
                              phases: [...(newSong.audioLinks?.phases || []), newPhase]
                            }
                          });
                          setNewPhaseNames({...newPhaseNames, [-1]: ''});
                        }
                      }}
                      className="placeholder:text-slate-400"
                    />
                    <Button 
                      onClick={() => {
                        if (newPhaseNames[-1]?.trim()) {
                          const newPhase = {
                            name: newPhaseNames[-1].trim(),
                            fullMix: '',
                            soprano: '',
                            tenor: '',
                            alto: '',
                            instrumentation: ''
                          };
                          setNewSong({
                            ...newSong,
                            audioLinks: {
                              phases: [...(newSong.audioLinks?.phases || []), newPhase]
                            }
                          });
                          setNewPhaseNames({...newPhaseNames, [-1]: ''});
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {newSong.audioLinks?.phases?.length ? newSong.audioLinks.phases.map((phase, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <Input
                            value={phase.name}
                            onChange={(e) => {
                              const updatedPhases = [...(newSong.audioLinks?.phases || [])];
                              updatedPhases[i] = { ...updatedPhases[i], name: e.target.value };
                              setNewSong({
                                ...newSong,
                                audioLinks: { phases: updatedPhases }
                              });
                            }}
                            className="font-semibold text-blue-800 bg-transparent border-none p-0"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedPhases = newSong.audioLinks?.phases?.filter((_, idx) => idx !== i) || [];
                              setNewSong({
                                ...newSong,
                                audioLinks: { phases: updatedPhases }
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            ['fullMix', 'Full Mix', 'bg-green-100'],
                            ['soprano', 'Soprano', 'bg-pink-100'],
                            ['tenor', 'Tenor', 'bg-blue-100'],
                            ['alto', 'Alto', 'bg-purple-100'],
                            ['instrumentation', 'Instrumentation', 'bg-orange-100']
                          ].map(([field, label, colorClass]) => (
                            <div key={field} className={`p-3 rounded-lg ${colorClass}`}>
                              <div className="font-medium text-xs uppercase tracking-wide mb-1">{label}</div>
                              <Input
                                value={phase[field as keyof typeof phase] || ''}
                                onChange={(e) => {
                                  const updatedPhases = [...(newSong.audioLinks?.phases || [])];
                                  updatedPhases[i] = { ...updatedPhases[i], [field]: e.target.value };
                                  setNewSong({
                                    ...newSong,
                                    audioLinks: { phases: updatedPhases }
                                  });
                                }}
                                placeholder="Audio URL"
                                className="text-sm placeholder:text-slate-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-500 text-center py-4">No audio phases yet</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="lyrics" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Start Lyrics
                      </div>
                      <Textarea
                        value={newSong.lyrics?.start || ''}
                        onChange={(e) => {
                          setNewSong({
                            ...newSong,
                            lyrics: { 
                              start: e.target.value, 
                              continue: newSong.lyrics?.continue || '' 
                            }
                          });
                        }}
                        placeholder="Enter start lyrics..."
                        className="min-h-32 bg-transparent border-none p-0 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                      <div className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        Continue Lyrics
                      </div>
                      <Textarea
                        value={newSong.lyrics?.continue || ''}
                        onChange={(e) => {
                          setNewSong({
                            ...newSong,
                            lyrics: { 
                              start: newSong.lyrics?.start || '', 
                              continue: e.target.value 
                            }
                          });
                        }}
                        placeholder="Enter continuation lyrics..."
                        className="min-h-32 bg-transparent border-none p-0 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200">
                <Button onClick={addNewSong} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Add Song
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}