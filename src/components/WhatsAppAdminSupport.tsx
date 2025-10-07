'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import { 
  MessageCircle, 
  Send, 
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User
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
  admin_response?: string; // Alternative field name
  created_at: string;
  updated_at: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  messages: SupportMessage[];
  lastMessage: SupportMessage;
  unreadCount: number;
}

export default function WhatsAppAdminSupport() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all messages and group by user
  const loadMessages = async () => {
    try {
      console.log('🔄 Loading support messages...');

      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('📥 Raw data from Supabase:', data?.length || 0, 'messages');
      if (data && data.length > 0) {
        console.log('📝 First message:', data[0]);
      }

      // Group messages by user (remove duplicates by ID)
      const grouped = new Map<string, SupportMessage[]>();
      const seenIds = new Set<string>();

      (data || []).forEach((msg: SupportMessage) => {
        // Skip duplicate messages
        if (seenIds.has(msg.id)) {
          console.log('⚠️ Skipping duplicate message:', msg.id);
          return;
        }
        seenIds.add(msg.id);

        const userId = msg.user_id;
        if (!grouped.has(userId)) {
          grouped.set(userId, []);
        }
        grouped.get(userId)!.push(msg);
      });

      // Convert to conversations
      const convos: Conversation[] = Array.from(grouped.entries()).map(([userId, messages]) => {
        const sortedMessages = messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const unreadCount = messages.filter(m => m.status === 'pending').length;
        
        return {
          userId,
          userName: messages[0].user_name,
          userEmail: messages[0].user_email,
          messages: sortedMessages,
          lastMessage: messages[0], // Already sorted by created_at desc
          unreadCount
        };
      });

      // Sort conversations by last message time
      convos.sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );

      setConversations(convos);
      setLoading(false);

      console.log('📊 Loaded conversations:', convos.length);
      if (convos.length === 0) {
        console.log('⚠️ No conversations found. Check if:');
        console.log('1. The support_messages table exists in Supabase');
        console.log('2. There are messages in the table');
        console.log('3. RLS policies allow reading the messages');
      } else {
        convos.forEach(conv => {
          console.log(`👤 ${conv.userName}: ${conv.messages.length} messages`);
        });
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setLoading(false);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    const replyTextToSend = replyText.trim();
    setReplyText(''); // Clear immediately for better UX

    try {
      // Get the latest message without admin reply/response
      const messageToReply = selectedConversation.messages
        .filter(m => !m.admin_reply && !m.admin_response)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (messageToReply) {
        console.log('📤 Sending admin reply to message:', messageToReply.id);
        console.log('📝 Reply text:', replyTextToSend);

        const { data, error } = await supabase
          .from('support_messages')
          .update({
            admin_response: replyTextToSend, // ✅ FIXED: Use admin_response (database field)
            admin_responded_at: new Date().toISOString(),
            status: 'resolved',
            updated_at: new Date().toISOString()
          })
          .eq('id', messageToReply.id)
          .select();

        if (error) {
          console.error('❌ Supabase error:', error);
          setReplyText(replyTextToSend); // Restore text on error
          alert('Failed to send reply: ' + error.message);
          return;
        }

        console.log('✅ Admin reply sent successfully:', data);
        await loadMessages();
      } else {
        console.log('⚠️ No message found to reply to');
        alert('No message to reply to. User may have deleted their message.');
        setReplyText(replyTextToSend); // Restore text
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel('admin_support_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'support_messages' },
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-screen">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200 bg-white`}>
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.userId === conv.userId ? 'bg-purple-100' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conv.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.userName}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage.subject}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.lastMessage.admin_reply || conv.lastMessage.admin_response || conv.lastMessage.message}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-purple-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-[#E5DDD5] relative" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: 'local'
        }}>
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center text-white font-semibold">
              {selectedConversation.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{selectedConversation.userName}</h3>
              <p className="text-sm text-gray-500">{selectedConversation.userEmail}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConversation.messages.map((msg, index) => (
              <div key={msg.id} className="space-y-2 animate-fadeIn">
                {/* User Message */}
                <div className="flex justify-start">
                  <div className="max-w-[75%] bg-white rounded-lg rounded-tl-none shadow-sm p-2.5">
                    {msg.subject && <p className="font-medium text-sm text-purple-500 mb-1">{msg.subject}</p>}
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-600">
                      {new Date(msg.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>

                {/* Admin Reply */}
                {(msg.admin_reply || msg.admin_response) && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-[#DCF8C6] text-gray-900 rounded-lg rounded-tr-none shadow-sm p-2.5">
                      <p className="text-sm whitespace-pre-wrap">{msg.admin_reply || msg.admin_response}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-600">
                        {new Date(msg.updated_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                        <Check className="w-3.5 h-3.5 -ml-2 text-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="p-3 bg-[#F0F0F0] border-t border-gray-300 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder="Type your reply..."
                className="flex-1 max-w-[calc(100%-56px)] px-3 py-2 bg-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none text-sm min-w-0"
                rows={2}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="w-11 h-11 flex-shrink-0 bg-purple-400 text-white rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-2">Choose a user from the list to view their messages</p>
          </div>
        </div>
      )}
    </div>
  );
}

