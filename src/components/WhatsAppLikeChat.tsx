'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Users, 
  Search, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  MessageCircle,
  Plus,
  UserPlus,
  Heart,
  Star,
  User
} from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_image?: string
  created_at: string
  message_type: 'text' | 'image' | 'voice' | 'file'
  is_read: boolean
  read_at?: string
}

interface ChatGroup {
  id: string
  name: string
  description: string
  group_type: 'pmc' | 'loveworld_singers' | 'region' | 'zone' | 'church' | 'designation' | 'administration'
  group_value: string
  members: GroupMember[]
  last_message?: ChatMessage
  unread_count: number
  created_at: string
}

interface GroupMember {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  designation?: string
  administration?: string
  is_admin: boolean
}

interface Friend {
  id: string
  user_id: string
  friend_id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  status: 'pending' | 'accepted' | 'blocked'
  last_message?: ChatMessage
  unread_count: number
}

interface WhatsAppLikeChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function WhatsAppLikeChat({ isOpen, onClose }: WhatsAppLikeChatProps) {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState<ChatGroup[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'groups' | 'friends' | 'chat'>('groups')
  const [showGroupMembers, setShowGroupMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load user's groups
  const loadUserGroups = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // For now, use dummy data to show how it works
      const dummyGroups: ChatGroup[] = [
        {
          id: 'pmc-group',
          name: 'PMC Group',
          description: 'Pastor Chris Ministry Choir',
          group_type: 'pmc',
          group_value: 'PMC',
          members: [
            {
              id: 'user1',
              user_id: 'user1',
              first_name: 'Sarah',
              last_name: 'Johnson',
              profile_image_url: '',
              designation: 'PMC',
              administration: 'Coordinator',
              is_admin: true
            },
            {
              id: 'user2',
              user_id: 'user2',
              first_name: 'Michael',
              last_name: 'Chen',
              profile_image_url: '',
              designation: 'PMC',
              administration: 'Member',
              is_admin: false
            },
            {
              id: 'user3',
              user_id: 'user3',
              first_name: 'Emily',
              last_name: 'Williams',
              profile_image_url: '',
              designation: 'PMC',
              administration: 'Member',
              is_admin: false
            }
          ],
          unread_count: 3,
          created_at: new Date().toISOString()
        },
        {
          id: 'loveworld-singers',
          name: 'LoveWorld Singers',
          description: 'All LoveWorld Singers',
          group_type: 'loveworld_singers',
          group_value: 'LoveWorld Singers',
          members: [
            {
              id: 'user4',
              user_id: 'user4',
              first_name: 'David',
              last_name: 'Martinez',
              profile_image_url: '',
              designation: 'Soprano',
              administration: 'Member',
              is_admin: false
            },
            {
              id: 'user5',
              user_id: 'user5',
              first_name: 'Jessica',
              last_name: 'Brown',
              profile_image_url: '',
              designation: 'Alto',
              administration: 'Member',
              is_admin: false
            },
            {
              id: 'user6',
              user_id: 'user6',
              first_name: 'Robert',
              last_name: 'Davis',
              profile_image_url: '',
              designation: 'Tenor',
              administration: 'Member',
              is_admin: false
            }
          ],
          unread_count: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'lagos-region',
          name: 'Lagos Region',
          description: 'Singers from Lagos region',
          group_type: 'region',
          group_value: 'Lagos',
          members: [
            {
              id: 'user7',
              user_id: 'user7',
              first_name: 'Grace',
              last_name: 'Okafor',
              profile_image_url: '',
              designation: 'Soprano',
              administration: 'Member',
              is_admin: false
            },
            {
              id: 'user8',
              user_id: 'user8',
              first_name: 'James',
              last_name: 'Adebayo',
              profile_image_url: '',
              designation: 'Bass',
              administration: 'Member',
              is_admin: false
            }
          ],
          unread_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'soprano-group',
          name: 'Soprano Group',
          description: 'All Sopranos',
          group_type: 'designation',
          group_value: 'Soprano',
          members: [
            {
              id: 'user9',
              user_id: 'user9',
              first_name: 'Mary',
              last_name: 'Thompson',
              profile_image_url: '',
              designation: 'Soprano',
              administration: 'Member',
              is_admin: false
            },
            {
              id: 'user10',
              user_id: 'user10',
              first_name: 'Lisa',
              last_name: 'Anderson',
              profile_image_url: '',
              designation: 'Soprano',
              administration: 'Member',
              is_admin: false
            }
          ],
          unread_count: 0,
          created_at: new Date().toISOString()
        }
      ]

      setGroups(dummyGroups)
      setLoading(false)
    } catch (error) {
      console.error('Error loading groups:', error)
      setLoading(false)
    }
  }

  // Load user's friends
  const loadFriends = async () => {
    if (!user) return

    try {
      // For now, use dummy data to show how it works
      const dummyFriends: Friend[] = [
        {
          id: 'friend1',
          user_id: user.id,
          friend_id: 'user1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          profile_image_url: '',
          status: 'accepted',
          unread_count: 2
        },
        {
          id: 'friend2',
          user_id: user.id,
          friend_id: 'user2',
          first_name: 'Michael',
          last_name: 'Chen',
          profile_image_url: '',
          status: 'accepted',
          unread_count: 0
        },
        {
          id: 'friend3',
          user_id: user.id,
          friend_id: 'user3',
          first_name: 'Emily',
          last_name: 'Williams',
          profile_image_url: '',
          status: 'accepted',
          unread_count: 1
        }
      ]

      setFriends(dummyFriends)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  // Load group members
  const loadGroupMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles!group_members_user_id_fkey(
            id,
            first_name,
            last_name,
            profile_image_url,
            designation,
            administration
          )
        `)
        .eq('group_id', groupId)

      if (error) throw error

      const formattedMembers: GroupMember[] = (data || []).map(member => ({
        id: member.user_id,
        user_id: member.user_id,
        first_name: member.profiles?.first_name || '',
        last_name: member.profiles?.last_name || '',
        profile_image_url: member.profiles?.profile_image_url,
        designation: member.profiles?.designation,
        administration: member.profiles?.administration,
        is_admin: member.is_admin || false
      }))

      setGroupMembers(formattedMembers)
    } catch (error) {
      console.error('Error loading group members:', error)
    }
  }

  // Load messages for selected group
  const loadGroupMessages = async (groupId: string) => {
    try {
      // For now, use dummy messages to show how it works
      const dummyMessages: ChatMessage[] = [
        {
          id: 'msg1',
          content: 'Good morning everyone! Ready for rehearsal today? 🎵',
          sender_id: 'user1',
          sender_name: 'Sarah Johnson',
          sender_image: '',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          message_type: 'text',
          is_read: true,
          read_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
        },
        {
          id: 'msg2',
          content: 'Yes! I\'m excited for today\'s session',
          sender_id: 'user2',
          sender_name: 'Michael Chen',
          sender_image: '',
          created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          message_type: 'text',
          is_read: true,
          read_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        },
        {
          id: 'msg3',
          content: 'Don\'t forget to bring your song sheets!',
          sender_id: 'user3',
          sender_name: 'Emily Williams',
          sender_image: '',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          message_type: 'text',
          is_read: true,
          read_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: 'msg4',
          content: 'I\'ll be there in 10 minutes',
          sender_id: user?.id || 'current-user',
          sender_name: 'You',
          sender_image: '',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          message_type: 'text',
          is_read: true,
          read_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
      ]

      setMessages(dummyMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Send message to group
  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: selectedGroup.id,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      setNewMessage('')
      loadGroupMessages(selectedGroup.id)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Add friend
  const addFriend = async (friendId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        })

      if (error) throw error

      // Reload friends
      loadFriends()
    } catch (error) {
      console.error('Error adding friend:', error)
    }
  }

  // Handle group selection
  const handleGroupSelect = (group: ChatGroup) => {
    setSelectedGroup(group)
    setActiveTab('chat')
    loadGroupMembers(group.id)
    loadGroupMessages(group.id)
  }

  // Handle friend selection
  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend)
    setActiveTab('chat')
    // Load individual messages here
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedGroup) {
        sendGroupMessage()
      }
    }
  }

  // Load data on mount
  useEffect(() => {
    if (isOpen && user) {
      loadUserGroups()
      loadFriends()
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">
              {activeTab === 'groups' && 'Groups'}
              {activeTab === 'friends' && 'Friends'}
              {activeTab === 'chat' && (selectedGroup?.name || selectedFriend?.first_name)}
            </h1>
            <p className="text-sm opacity-90">
              {activeTab === 'groups' && 'Your automatic groups'}
              {activeTab === 'friends' && 'Your friends'}
              {activeTab === 'chat' && (selectedGroup?.description || 'Personal chat')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'groups' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'friends' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Friends
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' && (
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{group.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {group.members.length} members
                      </p>
                    </div>
                    {group.unread_count > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {group.unread_count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="p-4">
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => handleFriendSelect(friend)}
                  className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {friend.profile_image_url ? (
                      <img 
                        src={friend.profile_image_url} 
                        alt={friend.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {friend.first_name} {friend.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                  {friend.unread_count > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {friend.unread_count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && selectedGroup && (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('groups')}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{selectedGroup.name}</h2>
                  <p className="text-sm opacity-90">{selectedGroup.members.length} members</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowGroupMembers(!showGroupMembers)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Group Members List */}
            {showGroupMembers && (
              <div className="bg-white border-b border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Group Members</h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {member.profile_image_url ? (
                          <img 
                            src={member.profile_image_url} 
                            alt={member.first_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{member.designation}</p>
                      </div>
                      <button
                        onClick={() => addFriend(member.user_id)}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Add to friends"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender_id === user?.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.sender_id === user?.id ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.sender_id === user?.id && (
                        <CheckCheck className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={sendGroupMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}