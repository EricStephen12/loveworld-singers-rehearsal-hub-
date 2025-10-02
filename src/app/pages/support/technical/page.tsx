'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScreenHeader from '@/components/ScreenHeader';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronRight,
  Wrench,
  MessageCircle,
  ArrowLeft,
  Smartphone,
  Monitor,
  Wifi,
  Volume2,
  RefreshCw,
  Bug,
  AlertTriangle
} from 'lucide-react';

export default function TechnicalSupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    router.push('/auth');
  };

  const menuItems = getMenuItems(handleLogout);

  const technicalIssues = [
    {
      id: 'audio',
      title: 'Audio Playback Issues',
      description: 'Songs not playing or audio problems',
      icon: Volume2,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      solutions: [
        'Check your device volume and mute settings',
        'Ensure your browser allows audio playback',
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Check your internet connection'
      ]
    },
    {
      id: 'performance',
      title: 'App Running Slowly',
      description: 'Performance and loading issues',
      icon: Monitor,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      solutions: [
        'Close other apps running in the background',
        'Restart your device',
        'Check your internet connection speed',
        'Clear browser cache and data',
        'Try using a different browser'
      ]
    },
    {
      id: 'connectivity',
      title: 'Connection Problems',
      description: 'Network and connectivity issues',
      icon: Wifi,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      solutions: [
        'Check your internet connection',
        'Try switching between WiFi and mobile data',
        'Restart your router/modem',
        'Check if other websites load properly',
        'Contact your internet service provider'
      ]
    },
    {
      id: 'device',
      title: 'Device Compatibility',
      description: 'Issues with specific devices',
      icon: Smartphone,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      solutions: [
        'Ensure your device meets minimum requirements',
        'Update your browser to the latest version',
        'Try using a different browser',
        'Check device storage space',
        'Restart your device'
      ]
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      <ScreenHeader
        title="Technical Support"
        onMenuClick={() => setIsMenuOpen(true)}
        leftButtons={
          <button
            onClick={() => router.push('/pages/support')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
        rightImageSrc="/logo.png"
      />

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Technical Support
          </h1>
          <p className="text-gray-600">
            Troubleshoot common technical issues and get help with app problems.
          </p>
        </div>

        {/* Common Issues */}
        <div className="space-y-4">
          {technicalIssues.map((issue) => (
            <div key={issue.id} className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${issue.iconBg} rounded-xl flex items-center justify-center`}>
                  <issue.icon className={`w-5 h-5 ${issue.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {issue.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Solutions to try:</h4>
                <ul className="space-y-1">
                  {issue.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Still having issues?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If these solutions don't resolve your problem, our technical support team is ready to help.
            </p>
            <div className="space-y-2">
              <Link
                href="/pages/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Technical Support
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-medium rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors w-full justify-center">
                <Bug className="w-4 h-4" />
                Report a Bug
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="bg-white/70 backdrop-blur-sm border-0 rounded-xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 ring-1 ring-black/5 text-center">
            <RefreshCw className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <span className="text-xs font-medium text-gray-700">Clear Cache</span>
          </button>
          <button className="bg-white/70 backdrop-blur-sm border-0 rounded-xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 ring-1 ring-black/5 text-center">
            <Monitor className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <span className="text-xs font-medium text-gray-700">Check Status</span>
          </button>
        </div>
        </div> {/* End Scrollable Content */}
      </div>

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  );
}
