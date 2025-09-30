"use client";

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export default function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline - Some features may be limited</span>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <WifiOff className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">Working Offline</h3>
          <p className="text-sm text-orange-700 mt-1">
            You're currently offline. You can view cached data, but some features may not be available.
          </p>
        </div>
      </div>
    </div>
  );
}



