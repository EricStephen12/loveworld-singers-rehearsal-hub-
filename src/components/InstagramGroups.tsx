'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Search, MoreVertical, Camera, Paperclip, Mic, Phone, Video, ChevronLeft, Check, CheckCheck, Users, UserPlus, Info, Heart, Reply, Share, ArrowUpRight, X, Play, Pause, Volume2 } from 'lucide-react'
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

export default function WhatsAppChat() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats')
  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
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
                .filter((u: any) => u.groups && u.groups.includes(groupName))
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
        const chatId = selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`
        console.log('Loading messages for chat:', chatId)
        
        const msgs = await FirebaseDatabaseService.getCollectionWhere(
          'group_messages',
          'group_id',
          '==',
          chatId
        )
        
        if (msgs && msgs.length > 0) {
        setMessages((msgs as Message[]).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ))
        } else {
          // If no messages found, create some sample messages for demo
          const sampleMessages: Message[] = [
            {
              id: '1',
              group_id: chatId,
              sender_id: selectedGroup ? selectedGroup.members[0]?.user_id || 'demo' : selectedFriend?.user_id || 'demo',
              sender_name: selectedGroup ? selectedGroup.members[0]?.first_name || 'Demo User' : selectedFriend?.first_name || 'Demo User',
              content: selectedGroup ? `Welcome to ${selectedGroup.name}! 🎵` : 'Hello! How are you?',
              timestamp: new Date(Date.now() - 60000).toISOString(),
              read: true
            }
          ]
          setMessages(sampleMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages([])
      }
    }

    loadMessages()
  }, [selectedGroup, selectedFriend])

  const handleSendMessage = async () => {
    if (!user?.uid || !newMessage.trim()) return
    if (!selectedGroup && !selectedFriend) return

    try {
      const chatId = selectedGroup ? selectedGroup.id : `dm_${selectedFriend?.user_id}`
      const message: Message = {
        id: Date.now().toString(),
        group_id: chatId,
        sender_id: user.uid,
        sender_name: `${profile?.first_name} ${profile?.last_name}`,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      }

      await FirebaseDatabaseService.createDocument('group_messages', message.id, message as any)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
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
    await interactionService.current.likeMessage(messageId, user.uid)
    // Refresh reactions
    const reactions = await interactionService.current.getMessageReactions(messageId)
    setMessageReactions(prev => new Map(prev.set(messageId, reactions)))
  }

  const handleReplyToMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setReplyingTo(message)
      setReplyText('')
    }
  }

  const handleShareMessage = async (messageId: string) => {
    if (!user?.uid) return
    const targetGroupId = selectedGroup?.id
    const targetFriendId = selectedFriend?.user_id
    await interactionService.current.shareMessage(messageId, user.uid, targetGroupId, targetFriendId)
  }

  const handleForwardMessage = async (messageId: string) => {
    if (!user?.uid) return
    const targetGroupId = selectedGroup?.id
    const targetFriendId = selectedFriend?.user_id
    await interactionService.current.forwardMessage(messageId, user.uid, targetGroupId, targetFriendId)
  }

  const handleSendReply = async () => {
    if (!user?.uid || !profile || !replyingTo || !replyText.trim()) return
    
    await interactionService.current.replyToMessage(
      replyingTo.id,
      user.uid,
      `${profile.first_name} ${profile.last_name}`,
      replyText.trim()
    )
    
    setReplyingTo(null)
    setReplyText('')
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

  const filteredChats = activeTab === 'chats' 
    ? groups.filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : friends.filter(friend => 
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
      {/* Group Info Modal */}
      {showGroupInfo && selectedGroup && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-96 md:rounded-lg max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center gap-3 sticky top-0">
              <button onClick={() => setShowGroupInfo(false)} className="hover:bg-purple-700 p-1 rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold">Group Info</h2>
            </div>

            {/* Group Details */}
            <div className="p-6 text-center border-b">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-3xl">
                  {selectedGroup.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedGroup.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedGroup.description}</p>
            </div>

            {/* Members List */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{selectedGroup.members.length} Members</h4>
              </div>
              
              <div className="space-y-1">
                {selectedGroup.members.map((member) => {
                  const isCurrentUser = member.user_id === user?.uid
                  const isFriend = friends.some(f => f.user_id === member.user_id)
                  
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {(member.first_name || 'U')[0]}{(member.last_name || '')[0]}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900">
                          {member.first_name || 'Unknown'} {member.last_name || ''}
                          {isCurrentUser && <span className="text-gray-500 text-sm ml-1">(You)</span>}
                        </h5>
                        <p className="text-sm text-gray-500">{member.designation}</p>
                      </div>

                      {!isCurrentUser && (
                        <button
                          onClick={() => handleAddFriend(member)}
                          disabled={isFriend}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            isFriend
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isFriend ? 'Friends' : 'Add Friend'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
          <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-lg">
            {/* Search Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center gap-3 rounded-t-lg">
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="hover:bg-purple-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">Search</h2>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={activeTab === 'chats' ? 'Search groups...' : 'Search friends...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery ? (
                filteredChats.length > 0 ? (
                  <div className="p-2">
                    {filteredChats.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (activeTab === 'chats') {
                            setSelectedGroup(item as Group)
                          } else {
                            setSelectedFriend(item as Friend)
                          }
                          setIsSearchOpen(false)
                          setSearchQuery('')
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          {activeTab === 'chats' ? (
                            <Users className="w-6 h-6 text-purple-600" />
                          ) : (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {((item as Friend).first_name || 'U')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {activeTab === 'chats' 
                              ? (item as Group).name 
                              : `${(item as Friend).first_name || 'Unknown'} ${(item as Friend).last_name || ''}`
                            }
                          </h3>
                          {activeTab === 'chats' && (
                            <p className="text-sm text-gray-500">
                              {(item as Group).members.length} members
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No {activeTab === 'chats' ? 'groups' : 'friends'} found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Search for {activeTab === 'chats' ? 'groups' : 'friends'}</p>
                  <p className="text-sm">Type to start searching</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat List View */}
      {!selectedGroup && !selectedFriend && (
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <header className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">LoveWorld Chats</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="hover:bg-purple-700 p-2 rounded-full transition-colors">
                <Camera className="w-5 h-5" />
              </button>
              <button className="hover:bg-purple-700 p-2 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="flex border-b bg-white">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Friends
            </button>
          </div>


          {/* Chats/Friends List */}
          <div className="flex-1 overflow-y-auto content-bottom-safe">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  {activeTab === 'chats' ? (
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  ) : (
                    <Users className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {activeTab === 'chats' ? 'No groups yet' : 'No friends yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'chats' 
                    ? 'Complete your profile to join groups' 
                    : 'Add friends from group members'}
                </p>
                {activeTab === 'chats' && (
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-medium"
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
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatLastMessageTime(group.last_message_time || group.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{group.last_message}</p>
                      {group.unread_count > 0 && (
                        <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
                          {group.unread_count}
                        </span>
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
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {(friend.first_name || 'U')[0]}{(friend.last_name || '')[0]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {friend.first_name || 'Unknown'} {friend.last_name || ''}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatLastMessageTime(friend.last_message_time || new Date().toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{friend.last_message}</p>
                      {friend.unread_count > 0 && (
                        <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
                          {friend.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat View */}
      {(selectedGroup || selectedFriend) && (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <header className="bg-purple-600 text-white px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedGroup(null)
                setSelectedFriend(null)
              }}
              className="hover:bg-purple-700 p-1 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {selectedGroup 
                  ? selectedGroup.name.split(' ').map(w => w[0]).join('').slice(0, 2)
                  : `${selectedFriend?.first_name[0]}${selectedFriend?.last_name[0]}`
                }
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">
                {selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
              </h2>
              <p className="text-xs text-purple-100">
                {selectedGroup ? `${selectedGroup.members.length} members` : selectedFriend?.designation}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button 
                onClick={handleVoiceCall}
                className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                title="Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              {selectedGroup && (
                <button 
                  onClick={() => setShowGroupInfo(true)}
                  className="hover:bg-purple-700 p-2 rounded-full transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[#efeae2] p-4 space-y-2 content-bottom-safe">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white rounded-lg shadow-sm p-6 max-w-sm">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === user?.uid
                const reactions = messageReactions.get(message.id)
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 relative ${
                        isMe
                          ? 'bg-[#dcf8c6] rounded-br-none'
                          : 'bg-white rounded-bl-none'
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setSelectedMessage(message)
                        setShowMessageMenu(true)
                      }}
                    >
                      {!isMe && selectedGroup && (
                        <p className="text-xs font-semibold text-purple-700 mb-1">
                          {message.sender_name}
                        </p>
                      )}
                      
                      {/* Message Content */}
                      {message.isVoiceMessage ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePlayVoiceMessage(message)}
                            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 rounded-full px-3 py-2 transition-colors"
                          >
                            <Volume2 className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-700">{message.content}</span>
                          </button>
                        </div>
                      ) : (
                      <p className="text-sm text-gray-900 break-words">{message.content}</p>
                      )}
                      
                      {/* Message Actions (appear on hover) */}
                      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleLikeMessage(message.id)}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          title="Like"
                        >
                          <Heart className="w-3 h-3 text-red-500" />
                        </button>
                        <button
                          onClick={() => handleReplyToMessage(message.id)}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          title="Reply"
                        >
                          <Reply className="w-3 h-3 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleShareMessage(message.id)}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          title="Share"
                        >
                          <Share className="w-3 h-3 text-green-500" />
                        </button>
                        <button
                          onClick={() => handleForwardMessage(message.id)}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          title="Forward"
                        >
                          <ArrowUpRight className="w-3 h-3 text-purple-500" />
                        </button>
                      </div>
                      
                      {/* Message Footer */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      
                      {/* Reactions */}
                      {reactions && (reactions.likes.length > 0 || reactions.shares.length > 0) && (
                        <div className="flex items-center gap-2 mt-1">
                          {reactions.likes.length > 0 && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {reactions.likes.length}
                            </span>
                          )}
                          {reactions.shares.length > 0 && (
                            <span className="text-xs text-green-500 flex items-center gap-1">
                              <Share className="w-3 h-3" />
                              {reactions.shares.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input with Safe Area */}
          <div className="bottom-input-safe bg-gray-100 px-3 py-2 flex items-end gap-2 min-w-0">
            <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 min-w-0">
              <button className="text-gray-500 hover:text-gray-700 mr-2 flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 outline-none text-sm min-w-0 w-full"
              />
            </div>
            
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleVoiceRecording}
                className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                  isRecording 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Message'}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo && (
            <div className="bg-blue-50 border-t border-blue-200 px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Reply className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Replying to {replyingTo.sender_name}</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-auto text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 min-w-0">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:border-blue-500 min-w-0"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call Interface */}
      {showCallInterface && callState && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={(e) => {
            // Close call if clicking on backdrop
            if (e.target === e.currentTarget) {
              webrtcService.current.endCall()
              setShowCallInterface(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                webrtcService.current.endCall()
                setShowCallInterface(false)
              }}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Close Call"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {callState.callType === 'video' ? 'Video Call' : 'Voice Call'}
              </h3>
              <p className="text-gray-600">
                {selectedGroup ? selectedGroup.name : `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
              </p>
            </div>

            {/* Video Display */}
            {callState.callType === 'video' && (
              <div className="mb-6">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Call Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => webrtcService.current.toggleMute()}
                className={`p-3 rounded-full ${
                  callState.isMuted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                title={callState.isMuted ? 'Unmute' : 'Mute'}
              >
                <Mic className="w-6 h-6" />
              </button>

              {callState.callType === 'video' && (
                <button
                  onClick={() => webrtcService.current.toggleVideo()}
                  className={`p-3 rounded-full ${
                    callState.isVideoEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-600 text-white'
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
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700"
                title="End Call"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>

            {/* Call Status */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {callState.isCallActive ? 'Connected' : 'Connecting...'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Press ESC or click outside to end call
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}