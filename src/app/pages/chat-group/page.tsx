'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Mic, Camera, MoreVertical, Users, Phone, Video } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

interface ChatMessage {
  id: string
  content: string
  sender_id: string
  sender_name: string
  created_at: string
  message_type: 'text' | 'image' | 'voice' | 'file'
  is_own: boolean
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      // For now, use dummy messages
      const dummyMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Welcome to the group! 🎵',
          sender_id: '1',
          sender_name: 'Sarah Johnson',
          created_at: '2024-12-01T10:00:00.000Z',
          message_type: 'text',
          is_own: false
        },
        {
          id: '2',
          content: 'Thanks for having me! Excited to be part of this ministry 🙏',
          sender_id: user?.id || '2',
          sender_name: 'You',
          created_at: '2024-12-01T10:05:00.000Z',
          message_type: 'text',
          is_own: true
        },
        {
          id: '3',
          content: 'Let\'s start with some warm-up exercises',
          sender_id: '1',
          sender_name: 'Sarah Johnson',
          created_at: '2024-12-01T10:10:00.000Z',
          message_type: 'text',
          is_own: false
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
      // Create new message object
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        content: messageText,
        sender_id: user.id,
        sender_name: 'You',
        created_at: new Date().toISOString(),
        message_type: 'text',
        is_own: true
      }

      // Add message to local state immediately
      setMessages(prev => [...prev, newMsg])

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
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 pt-20 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.is_own 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {!message.is_own && (
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {message.sender_name}
                </p>
              )}
              <p className="text-sm font-normal leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 font-normal ${
                message.is_own ? 'text-purple-100' : 'text-gray-400'
              }`}>
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed - Full Width */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 px-3 sm:px-4 py-4 w-full">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Camera className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="w-full px-4 py-3 pr-20 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-normal"
            />
            
            {/* Camera and Pin icons inside input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Show Send when typing, Mic when not typing */}
          {newMessage.trim() ? (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="p-2 rounded-full bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors"
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
