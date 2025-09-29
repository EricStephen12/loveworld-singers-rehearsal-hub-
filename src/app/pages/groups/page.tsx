'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  Send,
  Smile,
  Paperclip,
  Mic,
  Heart,
  Camera,
  Image as ImageIcon,
  File,
  Check,
  CheckCheck,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ChatService } from '@/lib/chat-service'
import { supabase } from '@/lib/supabase-client'
import type { Conversation, Message, ChatContact, TypingIndicator } from '@/types/supabase'

export default function GroupsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [currentView, setCurrentView] = useState<'conversations' | 'contacts' | 'chat'>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showReactions, setShowReactions] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations and contacts
  useEffect(() => {
    if (user?.id) {
      loadConversations()
      loadContacts()
      ChatService.updateOnlineStatus(user.id, true)

      // Subscribe to new messages
      const messagesChannel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            // Reload conversations when new message arrives
            loadConversations()

            // If we're in a chat and the message is for this conversation, add it
            if (currentConversation && payload.new.conversation_id === currentConversation.id) {
              loadMessages(currentConversation.id)
            }
          }
        )
        .subscribe()

      // Subscribe to conversation updates
      const conversationsChannel = supabase
        .channel('conversations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          () => {
            loadConversations()
          }
        )
        .subscribe()

      // Cleanup subscriptions
      return () => {
        messagesChannel.unsubscribe()
        conversationsChannel.unsubscribe()
        if (user?.id) {
          ChatService.updateOnlineStatus(user.id, false)
        }
      }
    }
  }, [user?.id, currentConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    if (!user?.id) return

    const data = await ChatService.getUserConversations(user.id)

    // Add demo data if no conversations exist
    if (data.length === 0) {
      const demoConversations = [
        {
          id: 'demo-1',
          user1_id: user.id,
          user2_id: 'demo-user-1',
          user1: profile,
          user2: {
            id: 'demo-user-1',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah@example.com'
          },
          last_message: {
            id: 'msg-1',
            content: 'Hey! Are we still practicing tomorrow?',
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            sender_id: 'demo-user-1'
          },
          unread_count: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user1_id: user.id,
          user2_id: 'demo-user-2',
          user1: profile,
          user2: {
            id: 'demo-user-2',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'michael@example.com'
          },
          last_message: {
            id: 'msg-2',
            content: 'Thanks for the song sheet! 🎵',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            sender_id: 'demo-user-2'
          },
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-3',
          user1_id: user.id,
          user2_id: 'demo-user-3',
          user1: profile,
          user2: {
            id: 'demo-user-3',
            first_name: 'Emily',
            last_name: 'Williams',
            email: 'emily@example.com'
          },
          last_message: {
            id: 'msg-3',
            content: 'See you at rehearsal! 👋',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            sender_id: user.id
          },
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setConversations(demoConversations as any)
    } else {
      setConversations(data)
    }
  }

  const loadContacts = async () => {
    if (!user?.id) return

    const data = await ChatService.getContacts(user.id)

    // Add demo data if no contacts exist
    if (data.length === 0) {
      const demoContacts = [
        {
          user: {
            id: 'demo-user-1',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah@example.com'
          },
          is_online: true,
          last_seen: new Date().toISOString(),
          shared_groups: ['Soprano', 'Praise Night Team'],
          unread_count: 2
        },
        {
          user: {
            id: 'demo-user-2',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'michael@example.com'
          },
          is_online: false,
          last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          shared_groups: ['Tenor', 'Worship Team'],
          unread_count: 0
        },
        {
          user: {
            id: 'demo-user-3',
            first_name: 'Emily',
            last_name: 'Williams',
            email: 'emily@example.com'
          },
          is_online: true,
          last_seen: new Date().toISOString(),
          shared_groups: ['Alto', 'Praise Night Team'],
          unread_count: 0
        },
        {
          user: {
            id: 'demo-user-4',
            first_name: 'David',
            last_name: 'Martinez',
            email: 'david@example.com'
          },
          is_online: false,
          last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          shared_groups: ['Bass', 'Worship Team'],
          unread_count: 0
        },
        {
          user: {
            id: 'demo-user-5',
            first_name: 'Jessica',
            last_name: 'Brown',
            email: 'jessica@example.com'
          },
          is_online: true,
          last_seen: new Date().toISOString(),
          shared_groups: ['Soprano', 'Choir'],
          unread_count: 1
        }
      ]
      setContacts(demoContacts as any)
    } else {
      setContacts(data)
    }
  }

  const startChat = async (contact: ChatContact) => {
    if (!user?.id) return
    
    setSelectedContact(contact)
    const conversation = await ChatService.getOrCreateConversation(user.id, contact.user.id)
    
    if (conversation) {
      setCurrentConversation(conversation)
      await loadMessages(conversation.id)
      setCurrentView('chat')
    }
  }

  const loadMessages = async (conversationId: string) => {
    const data = await ChatService.getConversationMessages(conversationId)

    // Add demo messages if no messages exist or it's a demo conversation
    if (data.length === 0 || conversationId.startsWith('demo-')) {
      const demoMessages = [
        {
          id: 'demo-msg-1',
          conversation_id: conversationId,
          sender_id: selectedContact?.user.id || 'demo-user-1',
          content: 'Hi! How are you doing?',
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          sender: selectedContact?.user || {
            id: 'demo-user-1',
            first_name: 'Sarah',
            last_name: 'Johnson'
          },
          reactions: []
        },
        {
          id: 'demo-msg-2',
          conversation_id: conversationId,
          sender_id: user?.id || 'current-user',
          content: "I'm doing great! Thanks for asking 😊",
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
          sender: {
            id: user?.id || 'current-user',
            first_name: profile?.first_name || 'You',
            last_name: profile?.last_name || ''
          },
          reactions: []
        },
        {
          id: 'demo-msg-3',
          conversation_id: conversationId,
          sender_id: selectedContact?.user.id || 'demo-user-1',
          content: 'Are we still practicing tomorrow at 5 PM?',
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
          sender: selectedContact?.user || {
            id: 'demo-user-1',
            first_name: 'Sarah',
            last_name: 'Johnson'
          },
          reactions: []
        },
        {
          id: 'demo-msg-4',
          conversation_id: conversationId,
          sender_id: user?.id || 'current-user',
          content: 'Yes! I already confirmed with the coordinator. See you there! 🎵',
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
          sender: {
            id: user?.id || 'current-user',
            first_name: profile?.first_name || 'You',
            last_name: profile?.last_name || ''
          },
          reactions: [
            {
              id: 'reaction-1',
              message_id: 'demo-msg-4',
              user_id: selectedContact?.user.id || 'demo-user-1',
              reaction_type: 'heart',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
              user: selectedContact?.user || {
                id: 'demo-user-1',
                first_name: 'Sarah',
                last_name: 'Johnson'
              }
            }
          ]
        },
        {
          id: 'demo-msg-5',
          conversation_id: conversationId,
          sender_id: selectedContact?.user.id || 'demo-user-1',
          content: 'Perfect! Can you bring the song sheets?',
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          sender: selectedContact?.user || {
            id: 'demo-user-1',
            first_name: 'Sarah',
            last_name: 'Johnson'
          },
          reactions: []
        },
        {
          id: 'demo-msg-6',
          conversation_id: conversationId,
          sender_id: user?.id || 'current-user',
          content: 'Sure thing! I have them ready 📄',
          message_type: 'text',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          sender: {
            id: user?.id || 'current-user',
            first_name: profile?.first_name || 'You',
            last_name: profile?.last_name || ''
          },
          reactions: []
        }
      ]
      setMessages(demoMessages as any)
    } else {
      setMessages(data)

      // Mark messages as read
      if (user?.id) {
        await ChatService.markMessagesAsRead(conversationId, user.id)
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !user?.id) return

    const message = await ChatService.sendMessage(
      currentConversation.id,
      user.id,
      newMessage.trim()
    )

    if (message) {
      setMessages(prev => [...prev, message])
      setNewMessage('')
      setIsTyping(false)
      
      // Clear typing indicator
      await ChatService.setTypingIndicator(currentConversation.id, user.id, false)
    }
  }

  const handleTyping = useCallback(async (text: string) => {
    setNewMessage(text)
    
    if (!currentConversation || !user?.id) return

    // Set typing indicator
    await ChatService.setTypingIndicator(currentConversation.id, user.id, true)
    setIsTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Clear typing indicator after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(async () => {
      await ChatService.setTypingIndicator(currentConversation.id, user.id, false)
      setIsTyping(false)
    }, 3000)
  }, [currentConversation, user?.id])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
    
    return date.toLocaleDateString()
  }

  const getMessageStatus = (message: Message) => {
    if (!message.is_read) return <Check className="w-4 h-4 text-gray-400" />
    return <CheckCheck className="w-4 h-4 text-blue-500" />
  }

  const handleReaction = async (messageId: string, reactionType: string) => {
    if (!user?.id) return
    
    await ChatService.addMessageReaction(messageId, user.id, reactionType)
    setShowReactions(null)
  }

  // Filter conversations and contacts based on search
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.user1_id === user?.id ? conv.user2 : conv.user1
    return otherUser?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredContacts = contacts.filter(contact =>
    contact.user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Conversations List View
  if (currentView === 'conversations') {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>
          <button
            onClick={() => setCurrentView('contacts')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm">Start a chat with someone from your groups</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = conversation.user1_id === user?.id ? conversation.user2 : conversation.user1
              const isOnline = contacts.find(c => c.user.id === otherUser?.id)?.is_online || false

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    // Find or create contact from conversation
                    let contact = contacts.find(c => c.user.id === otherUser?.id)

                    // If contact doesn't exist (demo data), create it from conversation
                    if (!contact && otherUser) {
                      contact = {
                        user: otherUser,
                        is_online: isOnline,
                        last_seen: new Date().toISOString(),
                        shared_groups: ['Demo Group'],
                        unread_count: conversation.unread_count || 0
                      } as any
                    }

                    if (contact) {
                      setSelectedContact(contact)
                      setCurrentConversation(conversation)
                      loadMessages(conversation.id)
                      setCurrentView('chat')
                    }
                  }}
                  className="flex items-center p-4 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                      </span>
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {otherUser?.first_name} {otherUser?.last_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {(conversation.unread_count || 0) > 0 && (
                        <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Contacts List View
  if (currentView === 'contacts') {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('conversations')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">New Chat</h1>
          <div className="w-9"></div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-sm">Make sure you're in the same groups</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.user.id}
                onClick={() => startChat(contact)}
                className="flex items-center p-4 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {contact.user.first_name?.[0]}{contact.user.last_name?.[0]}
                    </span>
                  </div>
                  {contact.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {contact.user.first_name} {contact.user.last_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {contact.is_online ? 'Online' : contact.last_seen ? formatTime(contact.last_seen) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {contact.shared_groups.join(', ')}
                    </p>
                    {(contact.unread_count || 0) > 0 && (
                      <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                        {contact.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Chat View
  if (currentView === 'chat' && selectedContact && currentConversation) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Chat Header - Fixed */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentView('conversations')}
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {selectedContact.user.first_name?.[0]}{selectedContact.user.last_name?.[0]}
                </span>
              </div>
              {selectedContact.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-gray-900">
                {selectedContact.user.first_name} {selectedContact.user.last_name}
              </h2>
              <p className="text-xs text-gray-500">
                {selectedContact.is_online ? 'Online' : selectedContact.last_seen ? formatTime(selectedContact.last_seen) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 pb-24">
          {messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
            const showTimestamp = index === messages.length - 1 || 
              new Date(message.created_at).getTime() - new Date(messages[index + 1].created_at).getTime() > 300000 // 5 minutes

            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwn && showAvatar && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-2 mt-1">
                      <span className="text-white text-xs font-semibold">
                        {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                  
                  <div className={`relative group ${isOwn ? 'ml-2' : 'mr-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    {/* Message Status and Time */}
                    <div className={`flex items-center mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.created_at)}
                      </span>
                      {isOwn && (
                        <div className="ml-1">
                          {getMessageStatus(message)}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {message.reactions.map((reaction) => (
                          <button
                            key={reaction.id}
                            className="bg-gray-100 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                          >
                            <span>{reaction.reaction_type === 'heart' ? '❤️' : 
                                   reaction.reaction_type === 'laugh' ? '😂' :
                                   reaction.reaction_type === 'wow' ? '😮' :
                                   reaction.reaction_type === 'sad' ? '😢' :
                                   reaction.reaction_type === 'angry' ? '😠' : '👍'}</span>
                            <span>{reaction.user?.first_name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reaction Button */}
                    <button
                      onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-gray-800 text-white rounded-full p-1">
                        <Heart className="w-3 h-3" />
                      </div>
                    </button>

                    {/* Reaction Picker */}
                    {showReactions === message.id && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 flex items-center space-x-1 p-1">
                        {[
                          { type: 'heart', icon: '❤️' },
                          { type: 'laugh', icon: '😂' },
                          { type: 'wow', icon: '😮' },
                          { type: 'sad', icon: '😢' },
                          { type: 'angry', icon: '😠' },
                          { type: 'thumbs_up', icon: '👍' }
                        ].map((reaction) => (
                          <button
                            key={reaction.type}
                            onClick={() => handleReaction(message.id, reaction.type)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <span className="text-lg">{reaction.icon}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {typingIndicators.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
            
            {newMessage.trim() ? (
              <button
                onClick={sendMessage}
                className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-2">
              <button className="p-3 rounded-lg hover:bg-gray-100 flex flex-col items-center">
                <Camera className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Camera</span>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 flex flex-col items-center">
                <ImageIcon className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Gallery</span>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 flex flex-col items-center">
                <File className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
