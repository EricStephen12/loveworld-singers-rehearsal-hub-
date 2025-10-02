import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin';
  priority: 'low' | 'medium' | 'high';
  sender_id?: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  is_read: boolean;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🔔 Real-time notification update:', payload);
          loadNotifications(); // Reload all notifications when any change occurs
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications'
        },
        (payload) => {
          console.log('👤 User notification status update:', payload);
          loadNotifications(); // Reload when read status changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user notifications with read status
      const { data, error } = await supabase
        .rpc('get_user_notifications')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading notifications:', error);
        setError(error.message);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error('❌ Unexpected error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_uuid: notificationId
      });

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return false;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );

      return true;
    } catch (err) {
      console.error('❌ Unexpected error marking notification as read:', err);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }

      return true;
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Note: We don't actually delete notifications from the database
      // as they might be needed for admin tracking. Instead, we mark them as read.
      // If deletion is needed, it should be done by admins only.

      await markAsRead(notificationId);
      return true;
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      return false;
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications
  };
}

// Hook for admins to create notifications
export function useNotificationActions() {
  const createNotificationForAll = async (data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    try {
      const { data: result, error } = await supabase.rpc('create_notification_for_all_users', {
        p_title: data.title,
        p_message: data.message,
        p_type: data.type || 'info',
        p_category: data.category || 'system',
        p_priority: data.priority || 'medium',
        p_action_url: data.actionUrl || null,
        p_expires_at: data.expiresAt || null
      });

      if (error) {
        console.error('❌ Error creating notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, notificationId: result };
    } catch (err) {
      console.error('❌ Unexpected error creating notification:', err);
      return { success: false, error: 'Failed to create notification' };
    }
  };

  const createNotificationForGroup = async (data: {
    title: string;
    message: string;
    groupName: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    try {
      const { data: result, error } = await supabase.rpc('create_notification_for_group', {
        p_title: data.title,
        p_message: data.message,
        p_group_name: data.groupName,
        p_type: data.type || 'info',
        p_category: data.category || 'system',
        p_priority: data.priority || 'medium',
        p_action_url: data.actionUrl || null,
        p_expires_at: data.expiresAt || null
      });

      if (error) {
        console.error('❌ Error creating group notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, notificationId: result };
    } catch (err) {
      console.error('❌ Unexpected error creating group notification:', err);
      return { success: false, error: 'Failed to create group notification' };
    }
  };

  return {
    createNotificationForAll,
    createNotificationForGroup
  };
}

