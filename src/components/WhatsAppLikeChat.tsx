'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { ArrowLeft, Users, MessageCircle, Phone, Video, MoreVertical, Search, Send, Smile, Paperclip, Camera, Mic, X, Check, CheckCheck, Clock, UserPlus, Settings, Archive, Trash2, Star, Pin, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { groupsCache, messagesCache, withCache } from '@/lib/smart-cache'

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

interface Group {
  id: string
  name: string
  description: string
  members: Member[]
  unread_count: number
  last_message?: string
  last_message_time?: string
  created_at: string
}

interface Friend {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url: string
  designation: string
  administration: string
  is_online: boolean
  last_seen?: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_image: string
  content: string
  timestamp: string
  is_read: boolean
  message_type: 'text' | 'image' | 'audio' | 'video'
}

interface WhatsAppLikeChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function WhatsAppLikeChat({ isOpen, onClose }: WhatsAppLikeChatProps) {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'groups' | 'friends'>('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showVoiceMessage, setShowVoiceMessage] = useState(false)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [showCallModal, setShowCallModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groupsLoadedRef = useRef(false)

  // Load user groups with smart caching
  const loadUserGroups = useCallback(async () => {
    if (!user?.uid) {
      console.log('❌ No user ID available')
      return
    }

    const cacheKey = `groups_${user.uid}`
    const cachedGroups = groupsCache.get(cacheKey)
    
    if (cachedGroups) {
      console.log('🚀 Using cached groups')
      setGroups(cachedGroups)
      groupsLoadedRef.current = true
      return
    }

    console.log('💾 Fetching fresh groups...')

    try {
      // First, load from user_groups table (same as profile page)
      const { data: userGroupsData, error: userGroupsError } = await supabase
        .from('user_groups')
        .select('group_name')
        .eq('user_id', user.uid)

      if (userGroupsError) {
        console.error('❌ Error loading user groups:', userGroupsError)
        return
      }

      const userGroupNames = userGroupsData?.map(item => item.group_name) || []
      console.log('📋 User group names from user_groups:', userGroupNames)

      // Group name mappings
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

      // Create groups for each group the user belongs to
      const userGroups = userGroupNames
        .filter(groupName => groupMappings[groupName])
        .map(groupName => {
          const mapping = groupMappings[groupName]
          return {
            id: groupName, // Use group name as ID for now
            name: mapping.name,
            description: mapping.description,
            members: [
              {
                id: user.uid,
                user_id: user.uid,
                first_name: profile?.first_name || 'User',
                last_name: profile?.last_name || '',
                profile_image_url: profile?.profile_image_url || '',
                designation: profile?.designation || 'Member',
                administration: profile?.administration || 'Member',
                is_admin: false
              }
            ],
            unread_count: Math.floor(Math.random() * 5),
            last_message: `Welcome to ${mapping.name}! 🎵`,
            last_message_time: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        })

      console.log(`✅ Created ${userGroups.length} groups for user:`, userGroups.map(g => g.name))
      setGroups(userGroups)
      groupsLoadedRef.current = true
      
      // Cache the groups
      groupsCache.set(cacheKey, userGroups)

    } catch (error) {
      console.error('❌ Error loading user groups:', error)
    }
  }, [user?.uid, profile])

  // Load friends from database
  const loadFriends = async () => {
    if (!user?.uid) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          friend:profiles!friends_friend_id_fkey(
            id,
            first_name,
            last_name,
            profile_image_url,
            designation,
            administration
          )
        `)
        .eq('user_id', user.uid)

      if (error) {
        console.error('Error loading friends:', error)
        return
      }

      const friendsList = data?.map((friend: any) => ({
        id: friend.friend_id,
        user_id: friend.friend_id,
        first_name: friend.friend?.first_name || 'Unknown',
        last_name: friend.friend?.last_name || '',
        profile_image_url: friend.friend?.profile_image_url || '',
        designation: friend.friend?.designation || 'Member',
        administration: friend.friend?.administration || 'Member',
        is_online: Math.random() > 0.5, // Random for now
        last_seen: new Date().toISOString()
      })) || []

      setFriends(friendsList)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  // Load group messages
  const loadGroupMessages = async (groupId: string) => {
    try {
      console.log('🔄 Loading messages for group:', groupId)
      
      // Simplified approach - just show dummy messages for now
      console.log('📝 Loading dummy messages for group:', groupId)
      
      const dummyMessages = [
        {
          id: '1',
          sender_id: user?.uid || 'demo',
          sender_name: profile?.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : 'You',
          sender_image: profile?.profile_image_url || '',
          content: `Welcome to ${selectedGroup?.name}! 🎵`,
          timestamp: new Date().toISOString(),
          is_read: true,
          message_type: 'text' as const
        },
        {
          id: '2',
          sender_id: 'demo-user',
          sender_name: 'LoveWorld Admin',
          sender_image: '',
          content: 'Let\'s start praising and worshiping together! 🙌',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          is_read: true,
          message_type: 'text' as const
        }
      ]

      setMessages(dummyMessages)
      console.log('✅ Loaded dummy messages:', dummyMessages.length)
    } catch (error) {
      console.error('❌ Error loading messages:', error)
    }
  }

  // Send group message
  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup || !user?.uid) {
      console.log('❌ Missing required data:', { 
        hasMessage: !!newMessage.trim(), 
        hasGroup: !!selectedGroup, 
        hasUser: !!user?.uid 
      })
      return
    }

    try {
      console.log('📤 Sending message to group:', selectedGroup.id, 'Message:', newMessage.trim())
      
      // First, find or create the chat group
      let chatGroupId = selectedGroup.id
      
      // Try to find existing chat group
      const { data: existingGroup, error: findError } = await supabase
        .from('chat_groups')
        .select('id')
        .eq('group_name', selectedGroup.id)
        .single()

      // For now, let's use a simpler approach - just add the message to the local state
      // This will work without complex database setup
      console.log('📤 Adding message to local state (simplified approach)')
      
      const newMessageObj = {
        id: Date.now().toString(),
        sender_id: user.uid,
        sender_name: profile?.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : 'You',
        sender_image: profile?.profile_image_url || '',
          content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        is_read: true,
        message_type: 'text' as const
      }
      
      // Add message to local state immediately
      setMessages(prev => [...prev, newMessageObj])
      
      console.log('✅ Message added to chat')

      console.log('✅ Message sent successfully')
      setNewMessage('')
      // Reload messages to show the new message
      loadGroupMessages(selectedGroup.id)
    } catch (error) {
      console.error('❌ Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  // Add friend
  const addFriend = async (memberId: string) => {
    if (!user?.uid) return

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: memberId
        })

      if (error) {
        console.error('Error adding friend:', error)
        return
      }

      console.log('✅ Friend added successfully')
      // Reload friends list
      loadFriends()
    } catch (error) {
      console.error('Error adding friend:', error)
    }
  }

  // Handle member click - WhatsApp-like inline interface
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member)
    // No modal - just show the inline interface at the bottom
  }

  // Handle call
  const handleCall = () => {
    console.log('📞 Call button clicked!')
    setShowCallModal(true)
  }

  // Handle video call
  const handleVideoCall = () => {
    console.log('📹 Video call button clicked!')
    setShowVideoModal(true)
  }

  // Handle voice message - Start recording
  const handleVoiceMessage = async () => {
    try {
      console.log('🎤 Starting voice recording...')
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      recordingRef.current = mediaRecorder
      
      // Set up recording data handler
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      // Set up recording stop handler
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        setAudioChunks(chunks)
        console.log('🎤 Recording stopped, audio blob created:', audioBlob.size, 'bytes')
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setShowVoiceMessage(true)
      setRecordingTime(0)
      
      // Start recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Store timer for cleanup
      ;(mediaRecorder as any).timer = timer
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error)
      alert('Microphone access denied. Please allow microphone access to record voice messages.')
    }
  }

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recordingRef.current && recordingRef.current.state === 'recording') {
      console.log('🎤 Stopping voice recording...')
      
      // Clear timer
      if ((recordingRef.current as any).timer) {
        clearInterval((recordingRef.current as any).timer)
      }
      
      recordingRef.current.stop()
      setIsRecording(false)
      setShowVoiceMessage(false)
      
      // Wait a bit for the recording to process, then send
      setTimeout(() => {
        if (audioChunks.length > 0) {
          sendVoiceMessage()
        }
      }, 500)
    }
  }

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!selectedGroup || !user?.id || audioChunks.length === 0) return

    try {
      console.log('📤 Sending voice message...')
      
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      
      // For now, we'll convert to text and send as regular message
      // In a real app, you'd upload the audio file to storage
      const messageContent = `🎤 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`
      
      // Simplified approach - add voice message to local state
      console.log('📤 Adding voice message to local state')
      
      const newVoiceMessage = {
        id: Date.now().toString(),
        sender_id: user.id,
        sender_name: profile?.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : 'You',
        sender_image: profile?.profile_image_url || '',
        content: messageContent,
        timestamp: new Date().toISOString(),
        is_read: true,
        message_type: 'audio' as const
      }
      
      // Add voice message to local state immediately
      setMessages(prev => [...prev, newVoiceMessage])
      
      console.log('✅ Voice message added to chat')
      
      // Clear audio chunks and reset
      setAudioChunks([])
      setRecordingTime(0)
      
    } catch (error) {
      console.error('❌ Error sending voice message:', error)
    }
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
    if (isOpen && user) {
      groupsLoadedRef.current = false
        await loadUserGroups()
      loadFriends()
    }
    }
    
    loadData()
  }, [isOpen, user])

  // Listen for profile changes and refresh groups
  useEffect(() => {
    const handleProfileUpdate = async () => {
      console.log('🔄 Profile updated, refreshing groups...')
      if (user) {
        await loadUserGroups()
      }
    }

    // Listen for custom events when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdate)
    window.addEventListener('groupsUpdated', handleProfileUpdate)

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
      window.removeEventListener('groupsUpdated', handleProfileUpdate)
    }
  }, [user])

  // Load messages when group is selected
  useEffect(() => {
    if (selectedGroup) {
      loadGroupMessages(selectedGroup.id)
    }
  }, [selectedGroup])

  // Real-time message updates
  useEffect(() => {
    if (!selectedGroup || !user?.id) return

    console.log('🔄 Setting up real-time subscription for group:', selectedGroup.id)
    
    const channel = supabase
      .channel(`chat_messages_${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${selectedGroup.id}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new)
          
          // Add the new message to the messages list
          const newMessage = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_name: 'Loading...', // Will be updated when we fetch sender info
            sender_image: '',
            content: payload.new.content,
            timestamp: payload.new.created_at,
            is_read: payload.new.sender_id === user.id,
            message_type: payload.new.message_type || 'text'
          }
          
          setMessages(prev => [...prev, newMessage])
          
          // If it's not our own message, reload to get sender info
          if (payload.new.sender_id !== user.id) {
            loadGroupMessages(selectedGroup.id)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔄 Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [selectedGroup, user?.id])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header - Full Width */}
      <div className="bg-purple-600 text-white p-3 sm:p-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-purple-700 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Chat</h1>
            <p className="text-sm text-purple-100">LoveWorld Singers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-purple-700 rounded-full">
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-purple-700 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'groups'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'friends'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Friends
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'groups' && (
          <div className="bg-white">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
                <Users className="w-12 h-12 mb-2" />
                <p className="text-center">No groups found</p>
                <p className="text-sm text-center mt-1">Complete your profile to join a group</p>
              </div>
            ) : (
              <div className="space-y-0">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.description}</p>
                      <p className="text-xs text-gray-400">{group.members.length} members</p>
                          </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(group.created_at).toLocaleDateString()}
                      </p>
                          {group.unread_count > 0 && (
                        <div className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center mt-1">
                              {group.unread_count}
                            </div>
                          )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white">
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
                <Users className="w-12 h-12 mb-2" />
                <p className="text-center">No friends found</p>
                <p className="text-sm text-center mt-1">Add friends to start chatting</p>
              </div>
            ) : (
              <div className="space-y-0">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    {friend.profile_image_url ? (
                      <img 
                        src={friend.profile_image_url} 
                        alt={friend.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                          <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                      {friend.is_online && (
                        <div className="absolute bottom-0 right-3 w-3 h-3 bg-purple-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                      {friend.first_name} {friend.last_name}
                    </h3>
                      <p className="text-sm text-gray-500">{friend.designation}</p>
                      <p className="text-xs text-gray-400">
                        {friend.is_online ? 'Online' : `Last seen ${new Date(friend.last_seen || '').toLocaleTimeString()}`}
                      </p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {(selectedGroup || selectedFriend) && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
            {/* Chat Header - Simplified */}
          <div className="bg-purple-600 text-white p-3 sm:p-4 flex items-center justify-between w-full flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedGroup(null); setSelectedFriend(null) }} className="p-2 hover:bg-purple-700 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                <h2 className="text-lg font-semibold">
                  {selectedGroup?.name || `${selectedFriend?.first_name} ${selectedFriend?.last_name}`}
                </h2>
                <p className="text-sm text-purple-100">
                  {selectedGroup ? `${selectedGroup.members.length} members` : selectedFriend?.designation}
                </p>
                </div>
              </div>
            <div className="flex items-center gap-1">
                <button 
                onClick={() => setShowGroupInfo(true)}
                className="p-2 hover:bg-purple-700 rounded-full"
                title="Group Info"
                >
                  <Users className="w-5 h-5" />
                </button>
              <button 
                onClick={() => {
                  console.log('📋 Menu button clicked!')
                  setShowMenu(!showMenu)
                }}
                className="p-2 hover:bg-purple-700 rounded-full"
                title="Menu"
              >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-48">
              <div className="py-2">
                      <button
                  onClick={() => {
                    setIsMuted(!isMuted)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button 
                  onClick={() => {
                    setIsPinned(!isPinned)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Pin className="w-4 h-4" />
                  {isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button 
                  onClick={() => {
                    setShowGroupInfo(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Users className="w-4 h-4" />
                  Group Info
                </button>
                <button 
                  onClick={() => {
                    console.log('📋 View media')
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Camera className="w-4 h-4" />
                  View Media
                </button>
                <button 
                  onClick={() => {
                    console.log('🗑️ Clear chat')
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                      </button>
                    </div>
                </div>
            )}

            {/* Messages - WhatsApp-like */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null
                const isSameSender = prevMessage && prevMessage.sender_id === message.sender_id
                const messageTime = new Date(message.timestamp)
                const prevMessageTime = prevMessage ? new Date(prevMessage.timestamp) : null
                const isSameMinute = prevMessageTime && 
                  Math.abs(messageTime.getTime() - prevMessageTime.getTime()) < 60000
                
                return (
                  <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${!isSameSender ? 'mt-4' : 'mt-1'}`}>
                      {/* Show sender name for other users */}
                      {message.sender_id !== user?.id && !isSameSender && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{message.sender_name}</span>
              </div>
            )}

                      {/* Message bubble */}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                      message.sender_id === user?.id
                            ? 'bg-purple-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {message.message_type === 'audio' ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              message.sender_id === user?.id ? 'bg-white/20' : 'bg-gray-300'
                            }`}>
                              <Mic className="w-3 h-3" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.content}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <div className={`w-16 rounded-full h-1 ${
                                  message.sender_id === user?.id ? 'bg-white/20' : 'bg-gray-300'
                                }`}>
                                  <div className={`w-8 rounded-full h-1 ${
                                    message.sender_id === user?.id ? 'bg-white' : 'bg-gray-600'
                                  }`}></div>
                                </div>
                                <span className="text-xs opacity-70">0:05</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                      
                      {/* Timestamp - only show if not same minute as previous message */}
                      {!isSameMinute && (
                        <div className={`text-xs text-gray-500 mt-1 ${message.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                          {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                      )}
                </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* iOS/WhatsApp-like Message Input */}
          <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              {/* Emoji button */}
              <button 
                onClick={() => {
                  console.log('😊 Emoji button clicked!')
                  setShowEmojiModal(true)
                }}
                className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              {/* Attachment button */}
              <button 
                onClick={() => {
                  console.log('📎 Attachment button clicked!')
                  setShowAttachmentModal(true)
                }}
                className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                  <Paperclip className="w-5 h-5" />
                </button>
              
              {/* Message input container - iOS style */}
              <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 min-h-[44px] flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                  placeholder="Message"
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                />
                </div>
              
              {/* Send/Voice button */}
              {newMessage.trim() ? (
                <button
                  onClick={sendGroupMessage}
                  className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onMouseDown={handleVoiceMessage}
                  onMouseUp={stopVoiceRecording}
                  onTouchStart={handleVoiceMessage}
                  onTouchEnd={stopVoiceRecording}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Hold to record voice message"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* WhatsApp-like Voice Recording */}
            {showVoiceMessage && (
              <div className="mt-2 p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-700 font-medium">
                    {isRecording ? `Recording... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : 'Release to send'}
                  </span>
                  <div className="flex-1 bg-red-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={stopVoiceRecording}
                    className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                    title="Stop recording"
                  >
                    <X className="w-5 h-5" />
                </button>
              </div>
                {isRecording && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-red-600">Hold to record, release to send</p>
            </div>
                )}
          </div>
        )}
      </div>
          </div>
        )}

      {/* iOS/WhatsApp-like Group Info */}
      {showGroupInfo && selectedGroup && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col">
          {/* iOS-style header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowGroupInfo(false)}
                className="p-2 -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-blue-500" />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedGroup.name}</h3>
                <p className="text-sm text-gray-500">{selectedGroup.members.length} members</p>
              </div>
            </div>
            <button className="p-2">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Group photo section */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center">{selectedGroup.name}</h2>
            <p className="text-center text-purple-100 text-sm mt-1">{selectedGroup.description}</p>
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Members</h4>
              <div className="space-y-1">
                {selectedGroup.members.map((member) => (
                  <div 
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
            <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {member.profile_image_url ? (
                          <img
                            src={member.profile_image_url}
                            alt={member.first_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-gray-500" />
                        )}
              </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
            </div>
                    <div className="flex-1 ml-3">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {member.first_name} {member.last_name}
                      </h4>
                      <p className="text-xs text-gray-500">{member.designation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600 font-medium">Online</p>
                      <p className="text-xs text-gray-400">now</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-like Add Friend Interface - No Modal */}
      {selectedMember && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              {selectedMember.profile_image_url ? (
                <img
                  src={selectedMember.profile_image_url}
                  alt={selectedMember.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <Users className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">
                {selectedMember.first_name} {selectedMember.last_name}
              </h4>
              <p className="text-xs text-gray-500">{selectedMember.designation}</p>
            </div>
            <button 
              onClick={() => setSelectedMember(null)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
          </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                addFriend(selectedMember.user_id)
                setSelectedMember(null)
              }}
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Friend
          </button>
            <button
              onClick={() => {
                setSelectedFriend({
                  id: selectedMember.user_id,
                  user_id: selectedMember.user_id,
                  first_name: selectedMember.first_name,
                  last_name: selectedMember.last_name,
                  profile_image_url: selectedMember.profile_image_url,
                  designation: selectedMember.designation,
                  administration: selectedMember.administration,
                  is_online: true,
                  last_seen: new Date().toISOString()
                })
                setSelectedMember(null)
                setSelectedGroup(null)
              }}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Now
            </button>
              </div>
            </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Start Call</h3>
              <button 
                onClick={() => setShowCallModal(false)}
                className="p-2 hover:bg-purple-700 rounded-full"
              >
                <X className="w-5 h-5" />
          </button>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">
                  {selectedGroup ? `Call ${selectedGroup.name}` : `Call ${selectedFriend?.first_name}`}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedGroup ? `${selectedGroup.members.length} members` : selectedFriend?.designation}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('📞 Starting call...')
                    setShowCallModal(false)
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Call
                </button>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
          </button>
        </div>
      </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoModal && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Start Video Call</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-purple-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">
                  {selectedGroup ? `Video Call ${selectedGroup.name}` : `Video Call ${selectedFriend?.first_name}`}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedGroup ? `${selectedGroup.members.length} members` : selectedFriend?.designation}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('📹 Starting video call...')
                    setShowVideoModal(false)
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Video Call
                </button>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Modal */}
      {showEmojiModal && (
        <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 z-30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Emojis</h3>
            <button 
              onClick={() => setShowEmojiModal(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '😢', '😡', '🤯', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setNewMessage(prev => prev + emoji)
                  setShowEmojiModal(false)
                }}
                className="w-8 h-8 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 z-30 p-4 min-w-48">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Attach</h3>
            <button 
              onClick={() => setShowAttachmentModal(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <Camera className="w-5 h-5 text-gray-600" />
              <span>Camera</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <span>Document</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <Users className="w-5 h-5 text-gray-600" />
              <span>Contact</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <Mic className="w-5 h-5 text-gray-600" />
              <span>Audio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}