'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScreenHeader from '@/components/ScreenHeader';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import {
  MessageCircle,
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Pre-made FAQ data
const faqData: FAQ[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password". Enter your email address and check your inbox for reset instructions.',
    category: 'account'
  },
  {
    id: '2',
    question: 'Why can\'t I access the media player?',
    answer: 'Make sure you have a stable internet connection and try refreshing the page. If the issue persists, clear your browser cache.',
    category: 'technical'
  },
  {
    id: '3',
    question: 'How do I update my profile information?',
    answer: 'Go to your Profile page and tap the edit button next to any field you want to change. Don\'t forget to save your changes.',
    category: 'account'
  },
  {
    id: '4',
    question: 'The app is running slowly, what should I do?',
    answer: 'Try closing other apps on your device and restart the LoveWorld Singers app. Make sure you have a good internet connection.',
    category: 'technical'
  },
  {
    id: '5',
    question: 'How do I join a rehearsal group?',
    answer: 'Go to the Groups section and browse available groups. Tap "Join Group" on any group you\'re interested in.',
    category: 'general'
  },
  {
    id: '6',
    question: 'Can I download songs for offline use?',
    answer: 'Currently, songs are only available for streaming. Offline downloads will be available in a future update.',
    category: 'feature'
  }
];

export default function SupportPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <ScreenHeader
        title="Admin Support"
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Support
          </h1>
          <p className="text-gray-600">
            Find answers to common questions or chat with our admin team.
          </p>
        </div>

        {/* Search FAQ */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                <ChevronRight 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedFAQ === faq.id ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-gray-600 text-sm pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Still need help?</h2>

          <button
            onClick={() => router.push('/pages/chat')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Admin
          </button>
        </div>
      </div>

      {/* Shared Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={(() => {
          const menuItems = getMenuItems()
          return menuItems || []
        })()}
      />

    </div>
  );
}