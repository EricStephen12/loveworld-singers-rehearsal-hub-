'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Search, MoreVertical, Camera, Paperclip, Mic, Phone, Video, ChevronLeft, ChevronRight, ChevronDown, ArrowLeft, Check, CheckCheck, Users, UserPlus, Info, Heart, Reply, Share, ArrowUpRight, X, Play, Pause, Volume2, Copy, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { cacheService, CACHE_KEYS } from '@/lib/cache-service'
import { WebRTCService } from '@/lib/webrtc-service'
import { VoiceRecordingService } from '@/lib/voice-recording-service'
import { MessageInteractionService } from '@/lib/message-interaction-service'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
  description: string
  members: Member[]
  unread_count: number
  last_message?: string
  last_message_time?: string
  created_at: string
  group_image?: string
}

interface Member {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url: string
  designation: string
  administration: string
  is_admin: boolean
}

interface Message {
  id: string
  group_id: string
  sender_id: string
  sender_name: string
  content: string
  timestamp: string
  read: boolean
  isVoiceMessage?: boolean
  voiceData?: Blob
  isShared?: boolean
  isForwarded?: boolean
  originalMessageId?: string
}

interface Friend {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url: string
  designation: string
  administration: string
  last_message?: string
  last_message_time?: string
  unread_count: number
}

// Message Loading Skeleton
const MessageSkeleton = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
        <div className="max-w-[70%] space-y-2">
          <div className={`h-16 rounded-lg ${i % 2 === 0 ? 'bg-purple-200' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    ))}
  </div>
)

// Typing Indicator
const TypingIndicator = () => (
  <div className="flex justify-start mb-2 animate-fadeIn">
    <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
)

export default function WhatsAppChat() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chats' | 'colleagues'>('chats')
  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [chatBackground, setChatBackground] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showMessageMenu, setShowMessageMenu] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showCallInterface, setShowCallInterface] = useState(false)
  const [callState, setCallState] = useState<any>(null)
  const [recordingState, setRecordingState] = useState<any>(null)
  const [messageReactions, setMessageReactions] = useState<Map<string, any>>(new Map())
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Services
  const webrtcService = useRef(WebRTCService.getInstance())
  const voiceService = useRef(VoiceRecordingService.getInstance())
  const interactionService = useRef(MessageInteractionService.getInstance())
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Set up local video stream when call state changes
  useEffect(() => {
    if (callState?.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream
    }
  }, [callState?.localStream])

  // Handle keyboard shortcuts for call interface and search modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCallInterface && event.key === 'Escape') {
        webrtcService.current.endCall()
        setShowCallInterface(false)
      } else if (isSearchOpen && event.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    if (showCallInterface || isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showCallInterface, isSearchOpen])

  // Load user groups based on profile (keeping original logic)
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user?.uid || !profile) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Check cache first for instant loading
        const cacheKey = `${CACHE_KEYS.GROUPS}_${user.uid}`
        const cachedGroups = cacheService.get(cacheKey)
        if (cachedGroups) {
          console.log('🚀 Using cached groups - instant load!')
          setGroups(cachedGroups as Group[])
          setIsLoading(false)
          
          // Load fresh data in background
          setTimeout(async () => {
            try {
              const userGroups = (profile as any).groups || []
              console.log('User groups from profile:', userGroups)

        if (userGroups.length === 0) {
          setGroups([])
          setIsLoading(false)
          return
        }

        const groupMappings: Record<string, { name: string; description: string }> = {
          'yourloveworldsingers': {
            name: 'Your LoveWorld Singers',
            description: 'Your LoveWorld Singers group'
          },
          'pmc': {
            name: 'PMC',
            description: 'Pastor Chris Ministry Choir'
          },
          '24worship': {
            name: '24 Worship',
            description: '24 Worship group'
          },
          'lmaorchestra': {
            name: 'LMA/LOVEWORLD ORCHESTRA',
            description: 'LMA/LOVEWORLD ORCHESTRA group'
          },
          'nationalzonalchoir': {
            name: 'National Zonal Choir Representatives',
            description: 'National Zonal Choir Representatives group'
          },
          'internationalzonalchoir': {
            name: 'International Zonal Choir Representatives',
            description: 'International Zonal Choir Representatives group'
          }
        }

        // Load all members for each group from Firebase
        const userGroupsData = await Promise.all(
          userGroups
            .filter((groupName: string) => groupMappings[groupName])
            .map(async (groupName: string) => {
              const mapping = groupMappings[groupName]
              
              // Get all members from Firebase profiles collection who have this group
              const allUsers = await FirebaseDatabaseService.getCollection('profiles')
              const groupMembers = allUsers
                .filter((u: any) => {
                  // Check if user has this group in their groups array
                  const userGroups = u.groups || []
                  return Array.isArray(userGroups) && userGroups.includes(groupName)
                })
                .map((u: any) => ({
                  id: u.id,
                  user_id: u.id,
                  first_name: u.first_name || 'User',
                  last_name: u.last_name || '',
                  profile_image_url: u.profile_image_url || '',
                  designation: u.designation || 'Member',
                  administration: u.administration || 'Member',
                  is_admin: false
                }))
              
              console.log(`👥 Found ${groupMembers.length} members for ${mapping.name}`)

              return {
                id: groupName,
                name: mapping.name,
                description: mapping.description,
                members: groupMembers,
                unread_count: Math.floor(Math.random() * 5),
                last_message: `Welcome to ${mapping.name}! 🎵`,
                last_message_time: new Date().toISOString(),
                created_at: new Date().toISOString()
              }
            })
        )

              console.log(`✅ Created ${userGroupsData.length} groups for user:`, userGroupsData.map((g: any) => g.name))
              setGroups(userGroupsData)
              
              // Cache the groups for instant loading next time
              cacheService.setUserData(cacheKey, userGroupsData)
            } catch (error) {
              console.error('Background groups refresh failed:', error)
            }
          }, 100)
          return
        }
        
        // Fresh data loading (when no cache)
        const userGroups = (profile as any).groups || []
        console.log('User groups from profile:', userGroups)

        if (userGroups.length === 0) {
          setGroups([])
          setIsLoading(false)
          return
        }

        const groupMappings: Record<string, { name: string; description: string }> = {
          'yourloveworldsingers': {
            name: 'Your LoveWorld Singers',
            description: 'Your LoveWorld Singers group'
          },
          'pmc': {
            name: 'PMC',
            description: 'Pastor Chris Ministry Choir'
          },
          '24worship': {
            name: '24 Worship',
            description: '24 Worship group'
          },
          'lmaorchestra': {
            name: 'LMA/LOVEWORLD ORCHESTRA',
            description: 'LMA/LOVEWORLD ORCHESTRA group'
          },
          'nationalzonalchoir': {
            name: 'National Zonal Choir Representatives',
            description: 'National Zonal Choir Representatives group'
          },
          'internationalzonalchoir': {
            name: 'International Zonal Choir Representatives',
            description: 'International Zonal Choir Representatives group'
          }
        }

        // Load all members for each group from Firebase
        const userGroupsData = await Promise.all(
          userGroups
            .filter((groupName: string) => groupMappings[groupName])
            .map(async (groupName: string) => {
              const mapping = groupMappings[groupName]
              
              // Get all members from Firebase profiles collection who have this group
              const allUsers = await FirebaseDatabaseService.getCollection('profiles')
              const groupMembers = allUsers
                .filter((u: any) => u.groups && u.groups.includes(groupName))
                .map((u: any) => ({
                  id: u.id,
                  name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User',
                  avatar: u.profile_image_url || '',
                  status: 'online'
                }))

              return {
                id: groupName,
                name: mapping.name,
                description: mapping.description,
                members: groupMembers,
                unread_count: Math.floor(Math.random() * 5),
                last_message: `Welcome to ${mapping.name}! 🎵`,
                last_message_time: new Date().toISOString(),
                created_at: new Date().toISOString()
              }
            })
        )

        console.log(`✅ Created ${userGroupsData.length} groups for user:`, userGroupsData.map((g: any) => g.name))
        setGroups(userGroupsData)
        
        // Cache the groups for instant loading next time
        cacheService.setUserData(cacheKey, userGroupsData)
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading user groups:', error)
        setIsLoading(false)
      }
    }

    loadUserGroups()
  }, [user?.uid, profile])

  // Load friends from user's friends list in profile
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.uid || !profile) return

      try {
        // Check cache first for instant loading
        const cacheKey = `${CACHE_KEYS.FRIENDS}_${user.uid}`
        const cachedFriends = cacheService.get(cacheKey)
        if (cachedFriends) {
          console.log('🚀 Using cached friends - instant load!')
          setFriends(cachedFriends as Friend[])
          return
        }

        const userFriends = (profile as any).friends || []
        
        if (userFriends.length === 0) {
          setFriends([])
          return
        }

        // Get friend details from Firebase
        const friendsData = await Promise.all(
          userFriends.map(async (friendId: string) => {
            const friendDoc = await FirebaseDatabaseService.getDocument('users', friendId)
            if (friendDoc) {
              return {
                id: friendDoc.id,
                user_id: friendDoc.id,
                first_name: (friendDoc as any).first_name || 'User',
                last_name: (friendDoc as any).last_name || '',
                profile_image_url: (friendDoc as any).profile_image_url || '',
                designation: (friendDoc as any).designation || 'Member',
                administration: (friendDoc as any).administration || '',
                unread_count: Math.floor(Math.random() * 3),
                last_message: 'Tap to chat',
                last_message_time: new Date().toISOString()
              }
            }
            return null
          })
        )

        const validFriends = friendsData.filter(f => f !== null) as Friend[]
        setFriends(validFriends)
        
        // Cache the friends for instant loading next time
        cacheService.setUserData(cacheKey, validFriends)
      } catch (error) {
        console.error('Error loading friends:', error)
      }
    }

    loadFriends()
  }, [user?.uid, profile])

  // Load messages for selected group or friend
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedGroup && !selectedFriend) return

      try {
        setIsLoadingMessages(true)
        const chatId = selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`
        console.log('📨 Loading messages for chat:', chatId)
        
        const msgs = await FirebaseDatabaseService.getCollectionWhere(
          'group_messages',
          'group_id',
          '==',
          chatId
        )
        
        if (msgs && msgs.length > 0) {
          const sortedMessages = (msgs as Message[]).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          setMessages(sortedMessages)
          console.log(`✅ Loaded ${sortedMessages.length} messages`)
          
          // Load reactions for all messages
          const reactionsMap = new Map()
          for (const msg of sortedMessages) {
            const likes = await FirebaseDatabaseService.getCollectionWhere('message_likes', 'message_id', '==', msg.id)
            if (likes && likes.length > 0) {
              reactionsMap.set(msg.id, { likes, shares: [] })
            }
          }
          setMessageReactions(reactionsMap)
        } else {
          // If no messages found, show welcome message
          const welcomeMessage: Message = {
            id: `welcome_${chatId}`,
            group_id: chatId,
            sender_id: 'system',
            sender_name: 'System',
            content: selectedGroup 
              ? `Welcome to ${selectedGroup.name}! 🎵 Start chatting with your group members.` 
              : `Start your conversation with ${selectedFriend?.first_name}!`,
            timestamp: new Date().toISOString(),
            read: true
          }
          setMessages([welcomeMessage])
          console.log('📭 No messages found, showing welcome message')
        }
      } catch (error) {
        console.error('❌ Error loading messages:', error)
        setMessages([])
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
    
    // Set up real-time listener for new messages
    const chatId = selectedGroup ? selectedGroup.id : selectedFriend ? `dm_${selectedFriend.user_id}` : null
    if (!chatId) return
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(async () => {
      try {
        const msgs = await FirebaseDatabaseService.getCollectionWhere(
          'group_messages',
          'group_id',
          '==',
          chatId
        )
        
        if (msgs && msgs.length > 0) {
          const sortedMessages = (msgs as Message[]).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          setMessages(sortedMessages)
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [selectedGroup, selectedFriend])

  // Scroll detection for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [selectedGroup, selectedFriend])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close modals
      if (e.key === 'Escape') {
        if (showCallInterface) {
          webrtcService.current.endCall()
          setShowCallInterface(false)
        } else if (showMessageMenu) {
          setShowMessageMenu(false)
          setSelectedMessage(null)
        } else if (showGroupInfo) {
          setShowGroupInfo(false)
        } else if (isSearchOpen) {
          setIsSearchOpen(false)
          setSearchQuery('')
        } else if (replyingTo) {
          setReplyingTo(null)
          setReplyText('')
        }
      }
      
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCallInterface, showMessageMenu, showGroupInfo, isSearchOpen, replyingTo])

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  const handleSendMessage = async () => {
    if (!user?.uid || !newMessage.trim()) return
    if (!selectedGroup && !selectedFriend) return

    try {
      const chatId = selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`
      const messageId = `msg_${Date.now()}_${user.uid}`
      
      let content = newMessage.trim()
      
      // If replying, prepend reply reference
      if (replyingTo) {
        content = `↩️ Replying to "${replyingTo.content.substring(0, 30)}..."\n\n${content}`
      }
      
      const message: Message = {
        id: messageId,
        group_id: chatId,
        sender_id: user.uid,
        sender_name: `${profile?.first_name || 'User'} ${profile?.last_name || ''}`.trim(),
        content,
        timestamp: new Date().toISOString(),
        read: false
      }

      // Optimistic update - show message immediately
      setMessages(prev => [...prev, message])
      setNewMessage('')
      setReplyingTo(null)
      setReplyText('')

      // Save to Firebase in background
      await FirebaseDatabaseService.createDocument('group_messages', messageId, {
        ...message,
        reply_to: replyingTo?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ Message sent successfully:', messageId)
    } catch (error) {
      console.error('❌ Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleAddFriend = async (member: Member) => {
    if (!user?.uid || member.user_id === user.uid) return

    try {
      // Get current user's friends list
      const userFriends = (profile as any).friends || []
      
      // Check if already friends
      if (userFriends.includes(member.user_id)) {
        alert('Already friends!')
        return
      }

      // Add to friends list
      const updatedFriends = [...userFriends, member.user_id]
      await FirebaseDatabaseService.updateDocument('profiles', user.uid, {
        friends: updatedFriends
      })

      // Add to local state
      setFriends(prev => [...prev, {
        id: member.id,
        user_id: member.user_id,
        first_name: member.first_name || 'Unknown',
        last_name: member.last_name || '',
        profile_image_url: member.profile_image_url || '',
        designation: member.designation || '',
        administration: member.administration || '',
        unread_count: 0,
        last_message: 'Tap to chat',
        last_message_time: new Date().toISOString()
      }])

      alert(`Added ${member.first_name || 'Unknown'} ${member.last_name || ''} as friend!`)
      setShowGroupInfo(false)
    } catch (error) {
      console.error('Error adding friend:', error)
      alert('Failed to add friend')
    }
  }

  const handleVideoCall = async () => {
    const targetName = selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`
    const targetUserId = selectedGroup ? selectedGroup.id : selectedFriend?.user_id
    
    if (!targetUserId) return
    
    console.log(`Starting video call with ${targetName}`)
    
    // Check WebRTC support
    if (!WebRTCService.isSupported()) {
      alert('Video calls are not supported on this device')
      return
    }
    
    // Set up call callbacks
    webrtcService.current.setCallbacks({
      onCallStateChange: (state) => {
        setCallState(state)
        if (state.isInCall) {
          setShowCallInterface(true)
        }
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
        }
      },
      onCallEnded: () => {
        setShowCallInterface(false)
        setCallState(null)
      }
    })
    
    // Start the call
    const success = await webrtcService.current.startCall('video', targetUserId)
    if (!success) {
      alert('Failed to start video call')
    }
  }

  const handleVoiceCall = async () => {
    const targetName = selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`
    const targetUserId = selectedGroup ? selectedGroup.id : selectedFriend?.user_id
    
    if (!targetUserId) return
    
    console.log(`Starting voice call with ${targetName}`)
    
    // Check WebRTC support
    if (!WebRTCService.isSupported()) {
      alert('Voice calls are not supported on this device')
      return
    }
    
    // Set up call callbacks
    webrtcService.current.setCallbacks({
      onCallStateChange: (state) => {
        setCallState(state)
        if (state.isInCall) {
          setShowCallInterface(true)
        }
      },
      onCallEnded: () => {
        setShowCallInterface(false)
        setCallState(null)
      }
    })
    
    // Start the call
    const success = await webrtcService.current.startCall('voice', targetUserId)
    if (!success) {
      alert('Failed to start voice call')
    }
  }

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      voiceService.current.stopRecording()
      setIsRecording(false)
    } else {
      // Check voice recording support
      if (!VoiceRecordingService.isSupported()) {
        alert('Voice recording is not supported on this device')
        return
      }
      
      // Set up voice recording callbacks
      voiceService.current.setCallbacks({
        onRecordingStateChange: (state) => {
          setRecordingState(state)
          setIsRecording(state.isRecording)
        },
        onRecordingComplete: async (voiceMessage) => {
          // Send voice message
          if (user?.uid && profile) {
            const message: Message = {
              id: voiceMessage.id,
              group_id: selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`,
              sender_id: user.uid,
              sender_name: `${profile.first_name} ${profile.last_name}`,
              content: `🎤 Voice message (${voiceService.current.formatDuration(voiceMessage.duration)})`,
              timestamp: voiceMessage.timestamp,
              read: false,
              isVoiceMessage: true,
              voiceData: voiceMessage.audioBlob
            }
            
            try {
              await FirebaseDatabaseService.createDocument('group_messages', message.id, message as any)
              setMessages(prev => [...prev, message])
            } catch (error) {
              console.error('Error sending voice message:', error)
            }
          }
        },
        onRecordingError: (error) => {
          console.error('Voice recording error:', error)
          alert('Voice recording failed')
        }
      })
      
      // Start recording
      const success = await voiceService.current.startRecording()
      if (!success) {
        alert('Failed to start voice recording')
      }
    }
  }

  // Message interaction handlers
  const handleLikeMessage = async (messageId: string) => {
    if (!user?.uid) return
    
    try {
      const likeId = `like_${messageId}_${user.uid}`
      
      // Check if already liked
      const existingLike = await FirebaseDatabaseService.getDocument('message_likes', likeId)
      
      if (existingLike) {
        // Unlike
        await FirebaseDatabaseService.deleteDocument('message_likes', likeId)
        console.log('❤️ Unliked message:', messageId)
      } else {
        // Like
        await FirebaseDatabaseService.createDocument('message_likes', likeId, {
          message_id: messageId,
          user_id: user.uid,
          user_name: `${profile?.first_name || 'User'} ${profile?.last_name || ''}`.trim(),
          created_at: new Date().toISOString()
        })
        console.log('❤️ Liked message:', messageId)
      }
      
      // Refresh reactions
      const likes = await FirebaseDatabaseService.getCollectionWhere('message_likes', 'message_id', '==', messageId)
      setMessageReactions(prev => new Map(prev.set(messageId, { likes: likes || [], shares: [] })))
    } catch (error) {
      console.error('❌ Error liking message:', error)
    }
  }

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setReplyingTo(message)
      setReplyText('')
    }
  }

  const handleShareMessage = async (messageId: string) => {
    if (!user?.uid) return
    alert('Share feature coming soon!')
  }

  const handleForwardMessage = async (messageId: string) => {
    if (!user?.uid) return
    alert('Forward feature coming soon!')
  }

  const handleSendReply = async () => {
    if (!user?.uid || !profile || !replyingTo || !replyText.trim()) return
    
    try {
      const chatId = selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`
      const replyId = `reply_${Date.now()}_${user.uid}`
      
      const replyMessage: Message = {
        id: replyId,
        group_id: chatId,
        sender_id: user.uid,
        sender_name: `${profile.first_name || 'User'} ${profile.last_name || ''}`.trim(),
        content: `↩️ Replying to "${replyingTo.content.substring(0, 30)}..."\n\n${replyText.trim()}`,
        timestamp: new Date().toISOString(),
        read: false
      }
      
      // Optimistic update
      setMessages(prev => [...prev, replyMessage])
      setReplyingTo(null)
      setReplyText('')
      
      // Save to Firebase
      await FirebaseDatabaseService.createDocument('group_messages', replyId, {
        ...replyMessage,
        reply_to: replyingTo.id,
        created_at: new Date().toISOString()
      })
      
      console.log('✅ Reply sent successfully')
    } catch (error) {
      console.error('❌ Error sending reply:', error)
      alert('Failed to send reply. Please try again.')
    }
  }

  const handlePlayVoiceMessage = (message: Message) => {
    if (message.isVoiceMessage && message.voiceData) {
      const audioUrl = URL.createObjectURL(message.voiceData)
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return formatTime(timestamp)
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Search only filters colleagues (friends)
  const filteredChats = activeTab === 'chats'
    ? groups.filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : friends.filter(friend =>
        `${friend.first_name || ''} ${friend.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )

  // For search page, only show colleagues
  const searchResults = friends.filter(friend =>
    `${friend.first_name || ''} ${friend.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Group Info - Full Screen (Telegram Style) */}
      {showGroupInfo && selectedGroup && (
        <div className="absolute inset-0 bg-white z-[60] flex flex-col">
          {/* Header */}
          <header className="bg-purple-600 text-white px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setShowGroupInfo(false)}
              className="hover:bg-purple-700 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">Group Info</h2>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* Group Header Section */}
            <div className="bg-white pb-6">
              <div className="p-6 text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-4xl">
                    {selectedGroup.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h3>
                <p className="text-sm text-gray-500 mt-2">{selectedGroup.description}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedGroup.members.length} members</p>
              </div>
            </div>

            {/* Members Section */}
            <div className="mt-2 bg-white">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 text-base">{selectedGroup.members.length} Members</h4>
              </div>

              <div className="divide-y divide-gray-100">
                {selectedGroup.members.map((member) => {
                  const isCurrentUser = member.user_id === user?.uid
                  const isFriend = friends.some(f => f.user_id === member.user_id)

                  return (
                    <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {(member.first_name || 'U')[0]}{(member.last_name || '')[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-base">
                          {member.first_name || 'Unknown'} {member.last_name || ''}
                          {isCurrentUser && <span className="text-gray-400 text-sm font-normal ml-1">(You)</span>}
                        </h5>
                        <p className="text-sm text-gray-500 mt-0.5">{member.designation || 'Member'}</p>
                      </div>

                      {!isCurrentUser && (
                        <button
                          onClick={() => handleAddFriend(member)}
                          disabled={isFriend}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isFriend
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                          }`}
                        >
                          {isFriend ? '✓ Added' : 'Add'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
          </div>
        </div>
      )}

      {/* Search Page - Full Screen (Telegram Style) */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Search Header - Fixed */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colleagues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:bg-gray-200 transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-200 p-1 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results - Scrollable (Colleagues Only) */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {searchQuery ? (
              searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => {
                        setSelectedFriend(friend)
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all active:bg-gray-100"
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {(friend.first_name || 'U')[0]}{(friend.last_name || '')[0]}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">
                          {friend.first_name || 'Unknown'} {friend.last_name || ''}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {friend.designation || 'Colleague'}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-sm text-gray-500">
                    No colleagues match "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Search Colleagues
                </h3>
                <p className="text-sm text-gray-500">
                  Type to search for colleagues
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat List View */}
      {!selectedGroup && !selectedFriend && (
        <div className="flex flex-col h-full bg-white">
          {/* Header - Purple Style */}
          <header className="bg-purple-600 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/home')}
                  className="hover:bg-purple-700 p-2 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-2xl font-bold text-white">Chats</h1>
              </div>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-purple-700 p-2 rounded-lg transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tabs - Purple Style */}
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('chats')}
                className={`pb-2 font-semibold text-sm transition-colors relative ${
                  activeTab === 'chats'
                    ? 'text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Groups
                {activeTab === 'chats' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('colleagues')}
                className={`pb-2 font-semibold text-sm transition-colors relative ${
                  activeTab === 'colleagues'
                    ? 'text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Colleagues
                {activeTab === 'colleagues' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
            </div>
          </header>


          {/* Chats List - Slack Style */}
          <div className="flex-1 overflow-y-auto content-bottom-safe bg-white">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  {activeTab === 'chats' ? (
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  ) : (
                    <Users className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'chats' ? 'No groups yet' : 'No colleagues yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'chats'
                    ? 'Complete your profile to join groups'
                    : 'Add colleagues from group members'}
                </p>
                {activeTab === 'chats' && (
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            ) : activeTab === 'chats' ? (
              (filteredChats as Group[]).map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-start gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Avatar - Slack Style */}
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-xs">
                      {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>

                  {/* Content - Slack Style */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">{group.name}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatLastMessageTime(group.last_message_time || group.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-gray-600 truncate leading-tight">{group.last_message}</p>
                      {group.unread_count > 0 && (
                        <div className="ml-2 w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              (filteredChats as Friend[]).map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className="flex items-start gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Avatar - Slack Style */}
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-xs">
                      {(friend.first_name || 'U')[0]}{(friend.last_name || '')[0]}
                    </span>
                  </div>

                  {/* Content - Slack Style */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">
                        {friend.first_name || 'Unknown'} {friend.last_name || ''}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatLastMessageTime(friend.last_message_time || new Date().toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-gray-600 truncate leading-tight">{friend.last_message}</p>
                      {friend.unread_count > 0 && (
                        <div className="ml-2 w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat View - Telegram Style */}
      {(selectedGroup || selectedFriend) && (
        <div
          className="flex flex-col h-full bg-white"
          onClick={() => setShowChatMenu(false)}
        >
          {/* Chat Header - Purple 600 */}
          <header className="bg-purple-600 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedGroup(null)
                setSelectedFriend(null)
              }}
              className="hover:bg-purple-700 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {selectedGroup
                  ? selectedGroup.name.split(' ').map(w => w[0]).join('').slice(0, 2)
                  : `${selectedFriend?.first_name[0]}${selectedFriend?.last_name[0]}`
                }
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate">
                {selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
              </h2>
              <p className="text-xs text-purple-100">
                {selectedGroup ? `${selectedGroup.members.length} members` : selectedFriend?.designation}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleVideoCall}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                title="Video Call"
              >
                <Video className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleVoiceCall}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                title="Voice Call"
              >
                <Phone className="w-5 h-5 text-white" />
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowChatMenu(!showChatMenu)
                  }}
                  className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                  title="More"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>

                {/* Chat Menu Dropdown */}
                {showChatMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowChatMenu(false)}
                    ></div>

                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50">
                      {selectedGroup && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowGroupInfo(true)
                            setShowChatMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                        >
                          <Info className="w-4 h-4" />
                          <span className="text-sm">Group Info</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Trigger file input
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (event: any) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                const imageUrl = e.target?.result as string
                                setChatBackground(imageUrl)
                              }
                              reader.readAsDataURL(file)
                            }
                          }
                          input.click()
                          setShowChatMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">Change Background</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert('Clear chat')
                          setShowChatMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Clear Chat</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert('Mute chat')
                          setShowChatMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">Mute Chat</span>
                      </button>
                      {selectedFriend && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this colleague from your list?')) {
                              alert('Delete colleague')
                            }
                            setShowChatMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm">Delete Colleague</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Messages Area - Telegram Style with Background */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-1 content-bottom-safe relative"
            style={{
              backgroundImage: chatBackground
                ? `url(${chatBackground})`
                : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23e5e7eb\' stroke-width=\'0.5\' fill=\'none\' opacity=\'0.3\'/%3E%3C/svg%3E")',
              backgroundColor: '#f0f2f5',
              backgroundSize: chatBackground ? 'cover' : 'auto',
              backgroundPosition: 'center',
              backgroundRepeat: chatBackground ? 'no-repeat' : 'repeat'
            }}
          >
            {isLoadingMessages ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-purple-600" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">No messages yet</p>
                  <p className="text-gray-500 text-sm mb-6">Start the conversation with a friendly message!</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setNewMessage('Hello! 👋')}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      Say Hi 👋
                    </button>
                    <button
                      onClick={() => setNewMessage('How are you?')}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      Ask How They Are
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = message.sender_id === user?.uid
                const reactions = messageReactions.get(message.id)
                const prevMessage = index > 0 ? messages[index - 1] : null
                const showAvatar = !isMe && (!prevMessage || prevMessage.sender_id !== message.sender_id)

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-1`}
                  >
                    {/* Avatar for group chats (left side) */}
                    {!isMe && selectedGroup && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {message.sender_name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble with Swipe Support */}
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 relative group ${
                        isMe
                          ? 'bg-purple-500 text-white animate-slide-in-right'
                          : 'bg-white text-gray-900 animate-slide-in-left'
                      }`}
                      onTouchStart={(e) => {
                        const touch = e.touches[0]
                        const startX = touch.clientX
                        const element = e.currentTarget

                        const handleTouchMove = (e: TouchEvent) => {
                          const touch = e.touches[0]
                          const diff = touch.clientX - startX

                          // Swipe right to reply (only if swiping right)
                          if (diff > 0 && diff < 100) {
                            element.style.transform = `translateX(${diff}px)`
                          }
                        }

                        const handleTouchEnd = (e: TouchEvent) => {
                          const touch = e.changedTouches[0]
                          const diff = touch.clientX - startX

                          // If swiped more than 60px, trigger reply
                          if (diff > 60) {
                            handleReplyToMessage(message.id)
                          }

                          // Reset position
                          element.style.transform = 'translateX(0)'
                          element.style.transition = 'transform 0.2s ease'

                          setTimeout(() => {
                            element.style.transition = ''
                          }, 200)

                          document.removeEventListener('touchmove', handleTouchMove)
                          document.removeEventListener('touchend', handleTouchEnd)
                        }

                        document.addEventListener('touchmove', handleTouchMove)
                        document.addEventListener('touchend', handleTouchEnd)
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setSelectedMessage(message)
                        setShowMessageMenu(true)
                      }}
                    >
                      {/* Sender name in group chats */}
                      {!isMe && selectedGroup && showAvatar && (
                        <p className="text-xs font-semibold text-purple-600 mb-1">
                          {message.sender_name}
                        </p>
                      )}

                      {/* Message Content */}
                      {message.isVoiceMessage ? (
                        <div className="flex items-center gap-2 py-1">
                          <button
                            onClick={() => handlePlayVoiceMessage(message)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-purple-100 hover:bg-purple-200'
                            }`}
                          >
                            <Play className={`w-3.5 h-3.5 ${isMe ? 'text-white' : 'text-purple-600'}`} />
                          </button>
                          <div className="flex-1 flex items-center gap-0.5">
                            {/* Voice waveform visualization */}
                            {[...Array(15)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-0.5 rounded-full ${isMe ? 'bg-white/60' : 'bg-purple-400'}`}
                                style={{ height: `${Math.random() * 16 + 6}px` }}
                              />
                            ))}
                          </div>
                          <span className={`text-xs ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                            0:42
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm leading-snug break-words">{message.content}</p>
                      )}

                      {/* Message Footer */}
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3 h-3 text-white/80" />
                        )}
                      </div>

                      {/* Reactions */}
                      {reactions && reactions.likes && reactions.likes.length > 0 && (
                        <div className="absolute -bottom-2 right-2 flex items-center gap-1 bg-white rounded-full px-2 py-0.5 shadow-md border border-gray-200">
                          <span className="text-xs flex items-center gap-0.5">
                            ❤️ <span className="font-medium">{reactions.likes.length}</span>
                          </span>
                        </div>
                      )}

                      {/* Message Actions - Always visible on hover/tap */}
                      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white rounded-full shadow-lg px-2 py-1 border border-gray-200">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLikeMessage(message.id)
                          }} 
                          className="text-base hover:scale-125 transition-transform p-1"
                          title="Like"
                        >
                          ❤️
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReplyToMessage(message.id)
                          }} 
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShareMessage(message.id)
                          }} 
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          title="Share"
                        >
                          <Share className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            
            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
            
            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all z-10"
                style={{ animation: 'bounce 2s infinite' }}
                title="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Reply Indicator - Above Input */}
          {replyingTo && (
            <div className="bg-purple-50 border-t border-purple-200 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Reply className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-900">
                      Replying to {replyingTo.sender_name}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 truncate">
                    {replyingTo.content}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                  className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Message Input - With Safe Area (like praise night categories) */}
          <div className="bottom-bar-enhanced bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2 min-w-0">
            {/* Attachment Button */}
            <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Container */}
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5 min-w-0">
              <input
                type="text"
                placeholder="Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 outline-none text-sm bg-transparent min-w-0 w-full placeholder-gray-400"
              />
            </div>

            {/* Send/Voice Button */}
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors flex-shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleVoiceRecording}
                className={`p-2 rounded-full transition-all flex-shrink-0 active:scale-95 ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Message'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* Message Context Menu Modal */}
      {showMessageMenu && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center animate-fadeIn">
          <div 
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:w-96 p-4"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Message Options</h3>
              <button
                onClick={() => {
                  setShowMessageMenu(false)
                  setSelectedMessage(null)
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  handleReplyToMessage(selectedMessage.id)
                  setShowMessageMenu(false)
                  setSelectedMessage(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Reply className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Reply</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessage.content)
                  setShowMessageMenu(false)
                  setSelectedMessage(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Copy Text</span>
              </button>

              <button
                onClick={() => {
                  handleShareMessage(selectedMessage.id)
                  setShowMessageMenu(false)
                  setSelectedMessage(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Share className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Share</span>
              </button>

              <button
                onClick={() => {
                  handleForwardMessage(selectedMessage.id)
                  setShowMessageMenu(false)
                  setSelectedMessage(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <ArrowUpRight className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Forward</span>
              </button>

              {selectedMessage.sender_id === user?.uid && (
                <>
                  <button
                    onClick={() => {
                      setShowMessageMenu(false)
                      setSelectedMessage(null)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this message?')) {
                        setMessages(prev => prev.filter(m => m.id !== selectedMessage.id))
                      }
                      setShowMessageMenu(false)
                      setSelectedMessage(null)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Interface - Improved Mobile Support */}
      {showCallInterface && callState && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              webrtcService.current.endCall()
              setShowCallInterface(false)
            }
          }}
        >
          <div 
            className="w-full max-w-4xl mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                webrtcService.current.endCall()
                setShowCallInterface(false)
              }}
              className="absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full transition-colors"
              title="Close Call"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Call Info */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <p className="font-semibold">
                {selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
              </p>
              <p className="text-sm text-gray-300">
                {callState.isCallActive ? 'Connected' : 'Connecting...'}
              </p>
            </div>

            {/* Video Display */}
            {callState.callType === 'video' ? (
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {/* Remote Video (Full Screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute bottom-4 right-4 w-32 h-40 sm:w-40 sm:h-52 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              // Voice Call UI
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Phone className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
                </h3>
                <p className="text-purple-200">
                  {callState.isCallActive ? 'Connected' : 'Calling...'}
                </p>
              </div>
            )}

            {/* Call Controls */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => webrtcService.current.toggleMute()}
                className={`p-4 rounded-full transition-all ${
                  callState.isMuted 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title={callState.isMuted ? 'Unmute' : 'Mute'}
              >
                <Mic className="w-6 h-6" />
              </button>

              {callState.callType === 'video' && (
                <button
                  onClick={() => webrtcService.current.toggleVideo()}
                  className={`p-4 rounded-full transition-all ${
                    callState.isVideoEnabled 
                      ? 'bg-white text-gray-700 hover:bg-gray-100' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  title={callState.isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                >
                  <Video className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={() => {
                  webrtcService.current.endCall()
                  setShowCallInterface(false)
                }}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                title="End Call"
              >
                <Phone className="w-6 h-6 rotate-135" />
              </button>
            </div>

            {/* Keyboard Hint */}
            <p className="text-center text-white text-sm mt-4 opacity-75">
              Press ESC to end call
            </p>
          </div>
        </div>
      )}
    </div>
  )
}