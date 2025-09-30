import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseSupport, SupportMessage } from '@/lib/supabase-support';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  supportMessageId?: string;
}

export function useSupportMessages() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load support messages from Supabase
  const loadMessages = useCallback(async () => {
    console.log('🔄 loadMessages called, profile:', profile?.email, 'user:', user?.id);

    if (!profile?.email || !user?.id) {
      console.log('❌ No profile or user, skipping load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching messages from Supabase...');
      // Get messages for current user from Supabase
      const userMessages = await SupabaseSupport.getUserMessages();
      console.log('📨 Received messages:', userMessages.length, userMessages);
      setMessages(userMessages);

      // Convert to chat format
      const chatMsgs = SupabaseSupport.convertToChat(userMessages);
      console.log('💬 Chat messages:', chatMsgs.length, chatMsgs);
      setChatMessages(chatMsgs);
    } catch (err) {
      console.error('Error loading support messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [profile?.email, user?.id]);

  // Send a new message (create support ticket)
  const sendMessage = useCallback(async (text: string) => {
    console.log('🚀 sendMessage called with:', { text, profile: profile?.email });

    if (!profile || !text.trim()) {
      console.log('❌ Early return: no profile or empty text');
      return;
    }

    // Add user message to chat immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {

      // Create support ticket in Supabase
      console.log('📝 Creating message with data:', {
        userName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        userEmail: profile.email,
        subject: text.length > 50 ? text.substring(0, 50) + '...' : text,
        message: text,
        category: 'general',
        priority: 'medium'
      });

      const newMessage = await SupabaseSupport.addMessage({
        userName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        userEmail: profile.email,
        subject: text.length > 50 ? text.substring(0, 50) + '...' : text,
        message: text,
        category: 'general',
        priority: 'medium'
      });

      console.log('📨 Message creation result:', newMessage);

      if (newMessage) {
        // Update the temporary message with real ID
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id
              ? { ...msg, id: `user-${newMessage.id}`, supportMessageId: newMessage.id }
              : msg
          )
        );

        // Reload messages to get the latest data
        setTimeout(() => {
          loadMessages();
        }, 100);
      } else {
        throw new Error('Failed to create support message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Remove the temporary message on error
      setChatMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  }, [profile, loadMessages]);

  // Set up real-time subscription for support message updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      unsubscribe = await SupabaseSupport.subscribeToUserUpdates(() => {
        loadMessages(); // Reload messages when there's an update
      });
    };

    if (profile?.email) {
      setupSubscription();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadMessages, profile?.email]);

  // Load messages when user/profile becomes available
  useEffect(() => {
    console.log('🔄 useEffect triggered, user:', user?.id, 'profile:', profile?.email);
    if (user?.id && profile?.email) {
      console.log('✅ User and profile available, loading messages...');
      loadMessages();
    }
  }, [loadMessages, user?.id, profile?.email]);

  return {
    messages,
    chatMessages,
    loading,
    error,
    sendMessage,
    loadMessages
  };
}
