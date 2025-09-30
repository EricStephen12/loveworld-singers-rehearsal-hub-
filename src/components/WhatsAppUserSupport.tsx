'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  X
} from 'lucide-react';

interface SupportMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_reply?: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppUserSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppUserSupport({ isOpen, onClose }: WhatsAppUserSupportProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's messages
  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  // Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !subject.trim() || !user || !profile) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user.id,
          user_name: `${profile.first_name} ${profile.last_name}`,
          user_email: profile.email,
          subject: subject.trim(),
          message: newMessage.trim(),
          status: 'pending',
          priority: 'medium'
        });

      if (error) throw error;

      setNewMessage('');
      setSubject('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on mount
  useEffect(() => {
    if (isOpen) {
      loadMessages();

      // Real-time subscription
      const channel = supabase
        .channel('user_support_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'support_messages',
            filter: `user_id=eq.${user?.id}`
          },
          () => loadMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, user]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#E5DDD5] rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* WhatsApp-style Header */}
        <div className="p-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="Support" className="w-8 h-8 rounded-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">LWSRH Support</h3>
            <p className="text-xs text-purple-100">Online</p>
          </div>
        </div>

        {/* Messages with WhatsApp pattern background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-center font-medium">No messages yet</p>
              <p className="text-sm text-center mt-2">Send your first message below</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={msg.id} className="space-y-2 animate-fadeIn">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-[#DCF8C6] rounded-lg rounded-tr-none shadow-sm p-2.5">
                      {msg.subject && <p className="font-medium text-sm mb-1 text-gray-900">{msg.subject}</p>}
                      <p className="text-sm whitespace-pre-wrap text-gray-900">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-600">
                        {formatTime(msg.created_at)}
                        {msg.admin_reply ? (
                          <div className="flex items-center">
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                            <Check className="w-3.5 h-3.5 -ml-2 text-blue-500" />
                          </div>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply */}
                  {msg.admin_reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[75%] bg-white rounded-lg rounded-tl-none shadow-sm p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center text-white text-[10px] font-semibold">
                            A
                          </div>
                          <p className="font-medium text-xs text-purple-500">Admin</p>
                        </div>
                        <p className="text-gray-900 text-sm whitespace-pre-wrap">{msg.admin_reply}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-600">
                          {formatTime(msg.updated_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* WhatsApp-style Input */}
        <div className="p-3 bg-[#F0F0F0] border-t border-gray-300">
          <div className="space-y-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
            />
            <div className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message"
                className="flex-1 max-w-[calc(100%-56px)] px-3 py-2 bg-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none text-sm min-w-0"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !subject.trim() || sending}
                className="w-11 h-11 flex-shrink-0 bg-purple-400 text-white rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

