"use client";

import { useEffect, useRef } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

/**
 * PushNotificationListener
 * 
 * Listens for new notifications in Firebase and triggers browser push notifications
 * This component runs in the background and doesn't render anything
 */
export default function PushNotificationListener() {
  const lastNotificationId = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializePushNotifications = async () => {
      // Check if push notifications are supported
      if (!pushNotificationService.isNotificationSupported()) {
        console.log('📵 Push notifications not supported in this browser');
        return;
      }

      // Check permission status
      const permissionStatus = pushNotificationService.getPermissionStatus();
      
      if (!permissionStatus.granted) {
        console.log('🔕 Push notification permission not granted');
        return;
      }

      // Initialize the push notification service
      const initialized = await pushNotificationService.initialize();
      
      if (!initialized) {
        console.log('⚠️ Failed to initialize push notification service');
        return;
      }

      console.log('✅ Push notification listener initialized');
      isInitialized.current = true;

      // Listen for new push notifications in Firebase
      try {
        const pushNotificationsRef = collection(db, 'push_notifications');
        const q = query(
          pushNotificationsRef,
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const notificationId = data.notificationId || change.doc.id;

              // Skip if this is the same notification we just processed
              if (lastNotificationId.current === notificationId) {
                return;
              }

              lastNotificationId.current = notificationId;

              // Skip initial load (only show new notifications)
              if (!isInitialized.current) {
                return;
              }

              console.log('🔔 New push notification received:', data);

              // Show browser push notification
              showPushNotification(data);
            }
          });
        });

        console.log('👂 Listening for push notifications...');
      } catch (error) {
        console.error('❌ Error setting up push notification listener:', error);
      }
    };

    // Initialize after a short delay to avoid showing notifications on page load
    const initTimeout = setTimeout(() => {
      initializePushNotifications();
    }, 2000);

    return () => {
      clearTimeout(initTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const showPushNotification = async (data: any) => {
    try {
      // Map notification type to emoji
      const typeEmoji: Record<string, string> = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        announcement: '📢',
        rehearsal: '🎵',
        song: '🎶',
        praise_night: '🌟',
        system: '🔔'
      };

      const emoji = typeEmoji[data.type] || typeEmoji[data.category] || '🔔';

      // Prepare notification payload
      const payload = {
        title: `${emoji} ${data.title}`,
        body: data.message,
        icon: '/APP ICON/pwa_192_filled.png',
        badge: '/APP ICON/pwa_192_filled.png',
        tag: data.category || 'notification',
        data: {
          type: data.type,
          category: data.category,
          action_url: data.action_url,
          notificationId: data.notificationId
        },
        requireInteraction: data.priority === 'high',
        silent: data.priority === 'low'
      };

      // Send the push notification
      const sent = await pushNotificationService.sendNotification(payload);

      if (sent) {
        console.log('✅ Push notification sent successfully');
      } else {
        console.log('⚠️ Failed to send push notification');
      }
    } catch (error) {
      console.error('❌ Error showing push notification:', error);
    }
  };

  // This component doesn't render anything
  return null;
}

