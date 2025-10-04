'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Mic, Camera, MoreVertical, Users, Phone, Video, Check, CheckCheck, Clock, Smile, Paperclip, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

interface ChatMessage {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_image?: string
  created_at: string
  message_type: 'text' | 'image' | 'voice' | 'file'
  is_own: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read'
  reply_to?: string
  is_edited?: boolean
  edited_at?: string
}

interface GroupMember {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url: string
  designation: string
  administration: string
  is_admin: boolean
}

function ChatGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineMembers, setOnlineMembers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get group ID from URL params
  const groupId = searchParams.get('groupId')

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load group data and messages
  useEffect(() => {
    if (groupId && user) {
      loadGroupData()
      loadMessages()
    }
  }, [groupId, user])

  const loadGroupData = async () => {
    if (!groupId) return

    try {
      // For now, use dummy data since we don't have the full group system
      setGroupName('Your LoveWorld Singers')
      setGroupMembers([
        {
          id: '1',
          user_id: '1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          profile_image_url: '',
          designation: 'LoveWorld Singer',
          administration: 'Member',
          is_admin: false
        },
        {
          id: '2',
          user_id: '2',
          first_name: 'Michael',
          last_name: 'Chen',
          profile_image_url: '',
          designation: 'LoveWorld Singer',
          administration: 'Member',
          is_admin: false
        }
      ])
    } catch (error) {
      console.error('Error loading group data:', error)
    }
  }

  const loadMessages = async () => {
    if (!groupId) return

    try {
      // Enhanced dummy messages with WhatsApp-like features
      const dummyMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Welcome to the group! 🎵',
          sender_id: '1',
          sender_name: 'Sarah Johnson',
          sender_image: '',
          created_at: '2024-12-01T10:00:00.000Z',
          message_type: 'text',
          is_own: false,
          status: 'read'
        },
        {
          id: '2',
          content: 'Thanks for having me! Excited to be part of this ministry 🙏',
          sender_id: user?.uid || '2',
          sender_name: 'You',
          sender_image: '',
          created_at: '2024-12-01T10:05:00.000Z',
          message_type: 'text',
          is_own: true,
          status: 'read'
        },
        {
          id: '3',
          content: 'Let\'s start with some warm-up exercises',
          sender_id: '1',
          sender_name: 'Sarah Johnson',
          sender_image: '',
          created_at: '2024-12-01T10:10:00.000Z',
          message_type: 'text',
          is_own: false,
          status: 'read'
        },
        {
          id: '4',
          content: 'Perfect! I\'m ready to start 🎤',
          sender_id: user?.uid || '2',
          sender_name: 'You',
          sender_image: '',
          created_at: '2024-12-01T10:12:00.000Z',
          message_type: 'text',
          is_own: true,
          status: 'read'
        },
        {
          id: '5',
          content: 'Great! Let\'s begin with vocal warm-ups. Everyone ready?',
          sender_id: '1',
          sender_name: 'Sarah Johnson',
          sender_image: '',
          created_at: '2024-12-01T10:15:00.000Z',
          message_type: 'text',
          is_own: false,
          status: 'read'
        }
      ]

      setMessages(dummyMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      // Create new message object with WhatsApp-like features
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        content: messageText,
        sender_id: user.uid,
        sender_name: 'You',
        sender_image: '',
        created_at: new Date().toISOString(),
        message_type: 'text',
        is_own: true,
        status: 'sending',
        reply_to: replyingTo?.id
      }

      // Add message to local state immediately
      setMessages(prev => [...prev, newMsg])
      setReplyingTo(null) // Clear reply

      // Simulate sending process
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        )
      }, 1000)

      // Simulate delivery
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        )
      }, 2000)

      // Simulate read status
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        )
      }, 3000)

      // Here you would normally save to database
      // await supabase.from('group_messages').insert({...})

      console.log('Message sent:', messageText)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set typing indicator
    if (!isTyping) {
      setIsTyping(true)
    }
    
    // Clear typing indicator after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 3000)
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header - Fixed - Full Width */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/pages/groups')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-gray-900">{groupName}</h1>
              <p className="text-xs text-gray-500 font-normal">{groupMembers.length} members</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-2 pt-20 pb-24">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1]
          const showAvatar = !message.is_own && (!prevMessage || prevMessage.sender_id !== message.sender_id)
          const showTime = !prevMessage || 
            new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 // 5 minutes
          
          return (
            <div key={message.id}>
              {showTime && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              <div className={`flex ${message.is_own ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  message.is_own ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar for other users */}
                  {!message.is_own && showAvatar && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl relative ${
                    message.is_own 
                      ? 'bg-purple-500 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}>
                    {/* Reply indicator */}
                    {message.reply_to && (
                      <div className="border-l-4 border-purple-300 pl-3 mb-2 text-xs opacity-75">
                        Replying to message...
                      </div>
                    )}
                    
                    {/* Sender name for other users */}
                    {!message.is_own && showAvatar && (
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {message.sender_name}
                      </p>
                    )}
                    
                    {/* Message content */}
                    <p className="text-sm font-normal leading-relaxed">{message.content}</p>
                    
                    {/* Message time and status */}
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.is_own ? 'text-purple-100' : 'text-gray-400'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.created_at)}
                      </span>
                      {message.is_own && getMessageStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Someone is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="fixed bottom-20 left-0 right-0 z-10 bg-gray-100 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Replying to {replyingTo.sender_name}</p>
              <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area - Fixed - Full Width */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 px-3 sm:px-4 py-4 w-full">
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="w-full px-4 py-3 pr-20 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-normal transition-all duration-200"
            />
            
            {/* Emoji and Camera icons inside input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Show Send when typing, Mic when not typing */}
          {newMessage.trim() ? (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="p-2 rounded-full bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors transform hover:scale-105 active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          ) : (
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatGroupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatGroupContent />
    </Suspense>
  )
}
