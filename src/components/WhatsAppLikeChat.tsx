'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Users, MessageCircle, Phone, Video, MoreVertical, Search, Send, Smile, Paperclip, Camera, Mic, X, Check, CheckCheck, Clock, UserPlus, Settings, Archive, Trash2, Star, Pin, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

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
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showVoiceMessage, setShowVoiceMessage] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groupsLoadedRef = useRef(false)

  // Simple group loading - same as profile page
  const loadUserGroups = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available')
      return
    }

    console.log('🔄 Loading groups from database...')

    try {
      // ✅ Use EXACT same approach as profile page
      const { data, error } = await supabase
        .from('user_groups')
        .select('group_name')
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error loading user groups:', error)
        return
      }

      const userGroupNames = data?.map(item => item.group_name) || []
      console.log('📋 User group names:', userGroupNames)

      // Simple group definitions
      const allGroups: Record<string, any> = {
        'yourloveworldsingers': {
          id: 'yourloveworldsingers',
          name: 'Your LoveWorld Singers',
          description: 'Your LoveWorld Singers group'
        },
        'PMC': {
          id: 'pmc',
          name: 'PMC',
          description: 'Pastor Chris Ministry Choir'
        },
        '24 Worship': {
          id: '24-worship',
          name: '24 Worship',
          description: '24 Worship group'
        },
        'Main Choir': {
          id: 'main-choir',
          name: 'Main Choir',
          description: 'Main Choir group'
        },
        'Teens Voice': {
          id: 'teens-voice',
          name: 'Teens Voice',
          description: 'Teens Voice group'
        },
        'Orchestra': {
          id: 'orchestra',
          name: 'Orchestra',
          description: 'Orchestra group'
        }
      }

      // Create groups for each group the user belongs to
      const userJoinedGroups = userGroupNames
        .filter(groupName => allGroups[groupName])
          .map(groupName => ({
            ...allGroups[groupName],
            members: [
              {
                id: user.id,
                user_id: user.id,
                first_name: profile?.first_name || 'User',
                last_name: profile?.last_name || '',
                profile_image_url: profile?.profile_image_url || '',
                designation: allGroups[groupName].name,
                administration: profile?.administration || 'Member',
                is_admin: false
              }
            ],
            unread_count: 0,
            created_at: new Date().toISOString()
          }))

        console.log(`✅ Created ${userJoinedGroups.length} groups for user:`, userJoinedGroups.map(g => g.name))
      setGroups(userJoinedGroups)
      groupsLoadedRef.current = true

    } catch (error) {
      console.error('❌ Error loading user groups:', error)
    }
  }

  // Load friends from database
  const loadFriends = async () => {
    if (!user?.id) return

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
        .eq('user_id', user.id)

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
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          sender:profiles!chat_messages_sender_id_fkey(
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      const messagesList = data?.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim(),
        sender_image: msg.sender?.profile_image_url || '',
        content: msg.content,
        timestamp: msg.created_at,
        is_read: true,
        message_type: 'text' as const
      })) || []

      setMessages(messagesList)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Send group message
  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: selectedGroup.id,
          sender_id: user?.id,
          content: newMessage.trim()
        })

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      setNewMessage('')
      // Reload messages
      loadGroupMessages(selectedGroup.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Add friend
  const addFriend = async (memberId: string) => {
    if (!user?.id) return

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

  // Handle member click
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member)
    setShowAddFriendModal(true)
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

  // Handle voice message
  const handleVoiceMessage = () => {
    console.log('🎤 Voice message button clicked!')
    setShowVoiceMessage(true)
    setIsRecording(true)
    console.log('🎤 Starting voice recording...')
  }

  // Stop voice recording
  const stopVoiceRecording = () => {
    setIsRecording(false)
    setShowVoiceMessage(false)
    console.log('🎤 Voice recording stopped')
    // Here you would process and send the voice message
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
            {/* Chat Header - Full Width */}
          <div className="bg-purple-600 text-white p-3 sm:p-4 flex items-center justify-between w-full">
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
            <div className="flex items-center gap-2">
                <button 
                onClick={() => setShowGroupInfo(true)}
                className="p-2 hover:bg-purple-700 rounded-full"
                title="Group Info"
                >
                  <Users className="w-5 h-5" />
                </button>
              <button 
                onClick={handleCall}
                className="p-2 hover:bg-purple-700 rounded-full"
                title="Call"
              >
                  <Phone className="w-5 h-5" />
                </button>
              <button 
                onClick={handleVideoCall}
                className="p-2 hover:bg-purple-700 rounded-full"
                title="Video Call"
              >
                  <Video className="w-5 h-5" />
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

            {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  console.log('😊 Emoji button clicked!')
                  setShowEmojiModal(true)
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  console.log('📎 Attachment button clicked!')
                  setShowAttachmentModal(true)
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                  <Paperclip className="w-5 h-5" />
                </button>
              <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                    placeholder="Type a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              {newMessage.trim() ? (
                <button
                  onClick={sendGroupMessage}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                >
                    <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onMouseDown={handleVoiceMessage}
                  onMouseUp={stopVoiceRecording}
                  onTouchStart={handleVoiceMessage}
                  onTouchEnd={stopVoiceRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                  title="Hold to record voice message"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Voice Message Recording */}
            {showVoiceMessage && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-700">
                    {isRecording ? 'Recording... Hold to continue' : 'Release to send'}
                  </span>
                  <button
                    onClick={stopVoiceRecording}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                </button>
              </div>
              </div>
            )}
            </div>
          </div>
        )}

      {/* Group Info Modal */}
      {showGroupInfo && selectedGroup && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Group Members</h3>
              <button 
                onClick={() => setShowGroupInfo(false)}
                className="p-2 hover:bg-purple-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
      </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {selectedGroup.members.map((member) => (
                  <div 
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      {member.profile_image_url ? (
                        <img
                          src={member.profile_image_url}
                          alt={member.first_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">{member.designation}</p>
                      <p className="text-xs text-gray-400">{member.administration}</p>
                    </div>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && selectedMember && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Friend</h3>
              <button 
                onClick={() => setShowAddFriendModal(false)}
                className="p-2 hover:bg-purple-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  {selectedMember.profile_image_url ? (
                    <img
                      src={selectedMember.profile_image_url}
                      alt={selectedMember.first_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-purple-600" />
                  )}
            </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedMember.designation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addFriend(selectedMember.user_id)
                    setShowAddFriendModal(false)
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
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
                    setShowAddFriendModal(false)
                    setSelectedGroup(null)
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Chat Now
          </button>
              </div>
            </div>
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