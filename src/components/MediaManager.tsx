"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image, 
  Music, 
  File, 
  Trash2, 
  Download, 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Folder,
  FolderOpen,
  X,
  Play,
  Pause,
  Check,
  CheckCircle
} from 'lucide-react';
import { uploadAudioToSupabase, deleteAudioFromSupabase } from '@/lib/supabase-storage';
import { getAllMedia, createMediaFile, deleteMediaFile, MediaFile as DatabaseMediaFile } from '@/lib/database';
import { Toast } from './Toast';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  folder?: string;
  storagePath?: string; // Path in Supabase Storage
}

interface MediaManagerProps {
  onSelectFile?: (file: MediaFile) => void;
  onClose?: () => void;
  filterType?: 'all' | 'image' | 'audio' | 'video' | 'document';
  selectionMode?: boolean;
  allowedTypes?: ('image' | 'audio' | 'video' | 'document')[];
}

export default function MediaManager({ 
  onSelectFile, 
  onClose, 
  filterType = 'all',
  selectionMode = false,
  allowedTypes = ['image', 'audio', 'video', 'document']
}: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>(filterType);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [dragOver, setDragOver] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load files from database
  useEffect(() => {
    loadFilesFromDatabase();
  }, []);

  const loadFilesFromDatabase = async () => {
    try {
      setLoading(true);
      const mediaFiles = await getAllMedia();
      
      // Convert database format to component format
      const convertedFiles: MediaFile[] = mediaFiles.map(dbFile => ({
        id: dbFile.id.toString(),
        name: dbFile.name,
        url: dbFile.url,
        type: dbFile.type,
        size: dbFile.size,
        uploadedAt: dbFile.uploadedAt,
        folder: dbFile.folder,
        storagePath: dbFile.storagePath
      }));
      
      setFiles(convertedFiles);
    } catch (error) {
      console.error('Error loading files from database:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'audio': return <Music className="w-6 h-6" />;
      case 'video': return <File className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-green-600 bg-green-100';
      case 'audio': return 'text-purple-600 bg-purple-100';
      case 'video': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = async (fileList: FileList) => {
    setUploading(true);
    
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Determine file type
        let fileType: 'image' | 'audio' | 'video' | 'document' = 'document';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('audio/')) fileType = 'audio';
        else if (file.type.startsWith('video/')) fileType = 'video';

        // Upload to Supabase Storage (like Spotify does)
        const uploadResult = await uploadAudioToSupabase(file);
        
        if (uploadResult) {
          // Save to database with Supabase Storage info
          const dbMediaFile = await createMediaFile({
            name: file.name,
            url: uploadResult.url,
            type: fileType,
            size: file.size,
            folder: fileType,
            storagePath: uploadResult.path, // Store path for deletion
            uploadedAt: new Date().toISOString()
          });
          
          if (dbMediaFile) {
            const newFile: MediaFile = {
              id: dbMediaFile.id.toString(),
              name: dbMediaFile.name,
              url: dbMediaFile.url,
              type: dbMediaFile.type,
              size: dbMediaFile.size,
              uploadedAt: dbMediaFile.uploadedAt,
              folder: dbMediaFile.folder,
              storagePath: dbMediaFile.storagePath
            };
            
            setFiles(prev => [newFile, ...prev]);
            addToast({
              type: 'success',
              message: `File "${file.name}" uploaded successfully!`
            });
          } else {
            addToast({
              type: 'error',
              message: `Failed to save "${file.name}" to database`
            });
          }
        } else {
          addToast({
            type: 'error',
            message: `Failed to upload "${file.name}"`
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        type: 'error',
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    if (selectionMode) {
      setSelectedFile(file);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedFile && onSelectFile && selectionMode) {
      onSelectFile(selectedFile);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleFileDelete = async (file: MediaFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        // Delete from database first
        const dbDeleteSuccess = await deleteMediaFile(parseInt(file.id));
        
        if (dbDeleteSuccess) {
          // Delete from Supabase Storage using stored path
          let supabaseDeleteSuccess = true;
          if (file.storagePath) {
            supabaseDeleteSuccess = await deleteAudioFromSupabase(file.storagePath);
          } else {
            // Fallback for legacy files without storagePath
            const fileName = file.url.split('/').pop();
            supabaseDeleteSuccess = await deleteAudioFromSupabase(`audio/${fileName}`);
          }
          
          if (supabaseDeleteSuccess) {
            setFiles(prev => prev.filter(f => f.id !== file.id));
            addToast({
              type: 'success',
              message: `File "${file.name}" deleted successfully!`
            });
          } else {
            // If Supabase Storage deletion fails, we should still remove from UI since DB is updated
            setFiles(prev => prev.filter(f => f.id !== file.id));
            addToast({
              type: 'warning',
              message: `File "${file.name}" removed from database but may still exist in cloud storage.`
            });
          }
        } else {
          addToast({
            type: 'error',
            message: `Failed to delete "${file.name}" from database`
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        addToast({
          type: 'error',
          message: 'Delete failed. Please try again.'
        });
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({
      type: 'success',
      message: 'URL copied to clipboard!'
    });
  };

  const handleAudioPlay = (file: MediaFile) => {
    if (playingAudioId === file.id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = file.url;
        audioRef.current.play().then(() => {
          setPlayingAudioId(file.id);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          addToast({
            type: 'error',
            message: 'Failed to play audio file'
          });
        });
      }
    }
  };

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setPlayingAudioId(null);
      };
      
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesAllowedTypes = allowedTypes.includes(file.type);
    
    return matchesSearch && matchesType && matchesFolder && matchesAllowedTypes;
  });

  const folders = ['all', ...Array.from(new Set(files.map(f => f.folder).filter(Boolean)))];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectionMode ? 'Select Media' : 'Media Library'}
            </h2>
            {selectionMode && selectedFile && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectionMode && selectedFile && (
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Select
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
            
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder === 'all' ? 'All Folders' : folder}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">
            Drag and drop files here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              browse files
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Supports {allowedTypes.join(', ')}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.map(type => {
              switch(type) {
                case 'image': return 'image/*';
                case 'audio': return 'audio/*';
                case 'video': return 'video/*';
                case 'document': return '.pdf,.doc,.docx,.txt';
                default: return '';
              }
            }).join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* View Controls */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Files Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {uploading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">Uploading files...</p>
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No files found</p>
            <p className="text-sm text-gray-400">Upload some files to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
            : 'space-y-2'
          }>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`group relative bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
                  selectionMode 
                    ? 'cursor-pointer hover:border-purple-300 hover:shadow-md' 
                    : 'border-gray-200'
                } ${
                  selectedFile?.id === file.id 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleFileSelect(file)}
              >
                {/* File Preview/Icon */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`p-4 rounded-full ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  {/* Play button for audio files */}
                  {file.type === 'audio' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAudioPlay(file);
                      }}
                      className="absolute top-2 left-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 rounded-full"
                    >
                      {playingAudioId === file.id ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  )}
                  
                  {/* Selection check mark */}
                  {selectionMode && selectedFile?.id === file.id && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(file.uploadedAt)}
                  </p>
                  {selectionMode && (
                    <div className="mt-2 text-xs font-medium">
                      {selectedFile?.id === file.id ? (
                        <span className="text-purple-600">Selected</span>
                      ) : (
                        <span className="text-gray-500">Click to select</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!selectionMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDelete(file);
                        }}
                        className="p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-1 right-1 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
