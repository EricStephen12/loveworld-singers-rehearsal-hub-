'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Music, Sparkles } from 'lucide-react';

export default function AudioLabPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Audio Lab</h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Music className="w-12 h-12 text-purple-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Audio Lab
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            Advanced audio tools and practice features are coming soon to enhance your musical journey.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Coming Soon
          </div>

          {/* Features Preview */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Coming:</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Advanced Audio Player</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Practice Mode with AI Feedback</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Recording Studio</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Music Library Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
