'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Mic, Camera, MoreVertical, Users, Phone, Video, Check, CheckCheck, Clock, Smile, Paperclip, X, Image, FileText, Download, Trash2, Edit, Copy, Info, Bell } from 'lucide-react'
import { useFeatureFlag } from '@/components/FeatureUpdateChecker'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

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
  
  // Check if video call feature is enabled
  const isVideoCallEnabled = useFeatureFlag('video-calls')
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
  const [showMenu, setShowMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  const [showMessageMenu, setShowMessageMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Get group ID and friend ID from URL params
  const groupId = searchParams.get('groupId')
  const friendId = searchParams.get('friendId')

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
      if (groupId === 'dm' && friendId) {
        // Direct message with a friend
        setGroupName('Direct Message')
        setGroupMembers([
          {
            id: friendId,
            user_id: friendId,
            first_name: 'Friend',
            last_name: 'Name',
            profile_image_url: '',
            designation: 'LoveWorld Singer',
            administration: 'Member',
            is_admin: false
          }
        ])
      } else {
        // Load real group data from Firebase
        try {
          const groupData = await FirebaseDatabaseService.getDocument('groups', groupId)
          if (groupData) {
            setGroupName((groupData as any).name || 'Group Chat')
            
            // Load group members
            const members = (groupData as any).members || []
            setGroupMembers(members)
          } else {
            // Fallback to dummy data
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
          }
        } catch (error) {
          console.error('Error loading group from Firebase:', error)
          // Fallback to dummy data
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
        }
      }
    } catch (error) {
      console.error('Error loading group data:', error)
    }
  }

  const loadMessages = async () => {
    if (!groupId) return

    try {
      // Enhanced dummy messages with WhatsApp-like features
      let dummyMessages: ChatMessage[] = []
      
      if (groupId === 'dm' && friendId) {
        // Direct message messages
        dummyMessages = [
          {
            id: '1',
            content: 'Hey! How are you doing? 🙏',
            sender_id: friendId,
            sender_name: 'Friend Name',
            sender_image: '',
            created_at: '2024-12-01T10:00:00.000Z',
            message_type: 'text',
            is_own: false,
            status: 'read'
          },
          {
            id: '2',
            content: 'I\'m doing great! Thanks for asking. How about you?',
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
            content: 'I\'m blessed! Ready for rehearsal today?',
            sender_id: friendId,
            sender_name: 'Friend Name',
            sender_image: '',
            created_at: '2024-12-01T10:10:00.000Z',
            message_type: 'text',
            is_own: false,
            status: 'read'
          }
        ]
      } else {
        // Group chat messages
        dummyMessages = [
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
      }

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

  // Emoji picker functionality
  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🎵', '🙏', '🔥', '💯', '✨', '🎤', '🎶', '🎸', '🎹', '🥁']
  
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        // Here you would upload the voice message
        console.log('Voice message recorded:', blob)
        // For now, just add a text message indicating voice
        const voiceMessage: ChatMessage = {
          id: Date.now().toString(),
          content: '🎤 Voice message',
          sender_id: user?.uid || '',
          sender_name: 'You',
          sender_image: '',
          created_at: new Date().toISOString(),
          message_type: 'voice',
          is_own: true,
          status: 'sent'
        }
        setMessages(prev => [...prev, voiceMessage])
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  // Camera functionality
  const handleCameraClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Here you would upload the image/video
        console.log('Media file selected:', file)
        // For now, just add a text message indicating media
        const mediaMessage: ChatMessage = {
          id: Date.now().toString(),
          content: file.type.startsWith('image/') ? '📷 Photo' : '🎥 Video',
          sender_id: user?.uid || '',
          sender_name: 'You',
          sender_image: '',
          created_at: new Date().toISOString(),
          message_type: file.type.startsWith('image/') ? 'image' : 'voice',
          is_own: true,
          status: 'sent'
        }
        setMessages(prev => [...prev, mediaMessage])
      }
    }
    input.click()
  }

  // Call functionality
  const handleCall = () => {
    console.log('Starting call...')
    // Here you would implement actual calling functionality
    alert('Call functionality would be implemented here')
  }

  const handleVideoCall = () => {
    console.log('Starting video call...')
    // Here you would implement actual video calling functionality
    alert('Video call functionality would be implemented here')
  }

  // Message menu functionality
  const handleMessageAction = (action: string, message: ChatMessage) => {
    switch (action) {
      case 'reply':
        setReplyingTo(message)
        break
      case 'copy':
        navigator.clipboard.writeText(message.content)
        break
      case 'edit':
        // Implement edit functionality
        break
      case 'delete':
        setMessages(prev => prev.filter(msg => msg.id !== message.id))
        break
    }
    setShowMessageMenu(false)
    setSelectedMessage(null)
  }

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              <p className="text-xs text-gray-500 font-normal">{groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleCall}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          {isVideoCallEnabled && (
            <button 
              onClick={handleVideoCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Video className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-2 pt-20 pb-24 content-bottom-safe">
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
                  <div 
                    className={`px-4 py-3 rounded-2xl relative cursor-pointer ${
                      message.is_own 
                        ? 'bg-purple-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setSelectedMessage(message)
                      setShowMessageMenu(true)
                    }}
                  >
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

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed bottom-20 left-0 right-0 z-20 bg-white border-t border-gray-200 p-4">
          <div className="grid grid-cols-10 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="p-2 text-2xl hover:bg-gray-100 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="fixed bottom-20 left-0 right-0 z-20 bg-red-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span>Recording... {formatRecordingTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-white text-red-500 rounded-lg font-medium"
          >
            Stop
          </button>
        </div>
      )}

      {/* Message Context Menu */}
      {showMessageMenu && selectedMessage && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-64">
            <h3 className="font-semibold mb-3">Message Options</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleMessageAction('reply', selectedMessage)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button
                onClick={() => handleMessageAction('copy', selectedMessage)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              {selectedMessage.is_own && (
                <>
                  <button
                    onClick={() => handleMessageAction('edit', selectedMessage)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleMessageAction('delete', selectedMessage)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setShowMessageMenu(false)}
              className="w-full mt-3 px-3 py-2 bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Group Menu */}
      {showMenu && (
        <div className="fixed top-16 right-4 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-48">
          <div className="p-2">
            <button
              onClick={() => {
                setShowGroupInfo(true)
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
            >
              <Info className="w-4 h-4" />
              <span>Group Info</span>
            </button>
            <button
              onClick={() => {
                // Implement mute notifications
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>Mute Notifications</span>
            </button>
          </div>
        </div>
      )}

      {/* Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Group Info</h3>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{groupName}</h4>
                <p className="text-sm text-gray-500">{groupMembers.length} members</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Members</h5>
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {member.first_name[0]}{member.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-500">{member.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed - Full Width with Safe Area */}
      <div className="bottom-input-safe bg-white border-t border-gray-200 px-3 sm:px-4 py-4 w-full">
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          <button 
            onClick={handleCameraClick}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
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
              <button 
                onClick={handleCameraClick}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
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
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
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
