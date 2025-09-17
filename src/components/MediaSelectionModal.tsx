"use client";

import React from 'react';
import { X } from 'lucide-react';
import MediaManager from './MediaManager';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  folder?: string;
}

interface MediaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: MediaFile) => void;
  allowedTypes?: ('image' | 'audio' | 'video' | 'document')[];
  title?: string;
}

export default function MediaSelectionModal({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  allowedTypes = ['audio'],
  title = "Select Media File"
}: MediaSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <MediaManager
            onSelectFile={(file) => {
              onFileSelect(file);
            }}
            onClose={() => {
              onClose();
            }}
            selectionMode={true}
            allowedTypes={allowedTypes}
            filterType={allowedTypes.length === 1 ? allowedTypes[0] : 'all'}
          />
        </div>
      </div>
    </div>
  );
}

