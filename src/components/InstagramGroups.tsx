'use client'

import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, UserPlus, Users, Camera, Video } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { useRouter } from 'next/navigation'
import { createSampleGroups } from '@/lib/create-sample-groups'

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

interface GroupPost {
  id: string
  group_id: string
  author_id: string
  author_name: string
  author_image: string
  content: string
  image_url?: string
  video_url?: string
  timestamp: string
  likes: string[]
  comments: PostComment[]
}

interface PostComment {
  id: string
  author_id: string
  author_name: string
  content: string
  timestamp: string
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

export default function InstagramGroups() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'friends' | 'chat'>('feed')
  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load user groups based on profile (like WhatsApp component)
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user?.uid || !profile) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Get user's group membership from profile groups array
        const userGroups = (profile as any).groups || []
        console.log('User groups from profile:', userGroups)

        if (userGroups.length === 0) {
          // User hasn't joined any groups yet
          setGroups([])
          setIsLoading(false)
          return
        }

        // Group name mappings (same as WhatsApp component)
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
        const userGroupsData = userGroups
          .filter((groupName: string) => groupMappings[groupName])
          .map((groupName: string) => {
            const mapping = groupMappings[groupName]
            return {
              id: groupName,
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

        console.log(`✅ Created ${userGroupsData.length} groups for user:`, userGroupsData.map((g: any) => g.name))
        setGroups(userGroupsData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading user groups:', error)
        setIsLoading(false)
      }
    }

    loadUserGroups()
  }, [user?.uid, profile])

  // Load friends (members of user's groups)
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.uid || groups.length === 0) {
        setFriends([])
        return
      }

      try {
        // Get all members from user's groups
        const allMembers: Friend[] = []

        for (const group of groups) {
          if (group.members) {
            for (const member of group.members) {
              // Don't include current user
              if (member.user_id !== user.uid) {
                allMembers.push({
                  id: member.id,
                  user_id: member.user_id,
                  first_name: member.first_name,
                  last_name: member.last_name,
                  profile_image_url: member.profile_image_url,
                  designation: member.designation,
                  administration: member.administration,
                  is_online: false, // We'll implement online status later
                })
              }
            }
          }
        }

        // Remove duplicates
        const uniqueFriends = allMembers.filter((friend, index, self) =>
          index === self.findIndex(f => f.user_id === friend.user_id)
        )

        setFriends(uniqueFriends)
      } catch (error) {
        console.error('Error loading friends:', error)
      }
    }

    loadFriends()
  }, [groups, user?.uid])

  // Load posts from user's groups
  useEffect(() => {
    const loadGroupPosts = async () => {
      if (groups.length === 0) {
        setGroupPosts([])
        return
      }

      try {
        // Get posts from all user's groups
        const allPosts: GroupPost[] = []

        for (const group of groups) {
          const posts = await FirebaseDatabaseService.getCollectionWhere('group_posts', 'group_id', '==', group.id)
          allPosts.push(...(posts as GroupPost[]))
        }

        // Sort by timestamp (newest first)
        allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setGroupPosts(allPosts)
      } catch (error) {
        console.error('Error loading group posts:', error)
      }
    }

    loadGroupPosts()
  }, [groups])

  const handleCreatePost = async () => {
    if (!user?.uid || !newPostContent.trim() || !selectedGroup) return

    try {
      const newPost: GroupPost = {
        id: Date.now().toString(),
        group_id: selectedGroup.id,
        author_id: user.uid,
        author_name: profile?.first_name + ' ' + profile?.last_name,
        author_image: profile?.profile_image_url || '',
        content: newPostContent,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
      }

      // Save to Firebase
      await FirebaseDatabaseService.createDocument('group_posts', newPost as any, '')

      // Add to local state
      setGroupPosts(prev => [newPost, ...prev])

      // Reset form
      setNewPostContent('')
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }


  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return

    try {
      const postIndex = groupPosts.findIndex(post => post.id === postId)
      if (postIndex === -1) return

      const post = groupPosts[postIndex]
      const isLiked = post.likes.includes(user.uid)

      const updatedLikes = isLiked
        ? post.likes.filter(id => id !== user.uid)
        : [...post.likes, user.uid]

      // Update in Firebase
      await FirebaseDatabaseService.updateDocument('group_posts', postId, {
        likes: updatedLikes
      })

      // Update local state
      setGroupPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: updatedLikes } : p
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-white">
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'cursive'}}>LoveWorld Groups</h1>
            <div className="flex items-center gap-4">
              <button className="text-white">
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
        {/* Stories Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600 mb-1">
                <span className="text-white text-xl">+</span>
              </div>
              <p className="text-xs text-gray-400">Your Story</p>
            </div>
            {groups.map((group) => (
              <div key={group.id} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-purple-500 mb-1">
                  <span className="text-white text-sm font-bold">
                    {group.name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate w-16">{group.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto">
            {/* Create Post */}
            {selectedGroup && (
              <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      Share something with {selectedGroup.name} group
                    </p>
                  </div>
                </div>

                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500"
                  rows={3}
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                      <Video className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {groupPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No posts yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share something!</p>
                </div>
              ) : (
                groupPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Post Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {post.author_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{post.author_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-4">
                      <p className="text-gray-900 mb-3">{post.content}</p>

                      {/* Post Image/Video - placeholder for now */}
                      {post.image_url && (
                        <div className="rounded-lg overflow-hidden mb-3">
                          <img src={post.image_url} alt="Post content" className="w-full h-64 object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              post.likes.includes(user?.uid || '')
                                ? 'text-red-600 bg-red-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                            <span className="text-sm">{post.likes.length}</span>
                          </button>

                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{post.comments.length}</span>
                          </button>
                        </div>

                        <button className="text-gray-600 hover:text-gray-900">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No groups found</p>
                <p className="text-sm text-gray-500 mt-1">Complete your profile to join groups</p>
                <button
                  onClick={() => router.push('/profile')}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Complete Profile
                </button>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => router.push(`/pages/chat-group?groupId=${group.id}`)}
                  className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {group.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{group.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{group.members.length} members</span>
                      {group.unread_count > 0 && (
                        <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                          {group.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No friends found</p>
                <p className="text-sm text-gray-500 mt-1">Friends are members of your groups</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => router.push(`/pages/chat-group?groupId=dm&friendId=${friend.id}`)}
                  className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="aspect-square bg-gray-800 flex items-center justify-center relative">
                    <span className="text-2xl font-semibold text-gray-400">
                      {friend.first_name[0]}{friend.last_name[0]}
                    </span>
                    {friend.is_online && (
                      <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">
                      {friend.first_name} {friend.last_name}
                    </h3>
                    <p className="text-sm text-gray-400">{friend.designation}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {friend.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Group Chat</h3>
                <p className="text-gray-400 mb-4">Chat with members of your groups</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'feed'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 mb-1">
                {activeTab === 'feed' ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.939-.068 1.281-.073 1.689-.073 5.018 0 3.301.005 3.737.073 5.018.2 4.32 2.622 6.74 6.98 6.94 1.28.058 1.688.072 5.018.072 3.329 0 3.738-.014 5.018-.072 4.354-.2 6.782-2.618 6.979-6.94.068-1.281.072-1.689.072-5.018 0-3.301-.004-3.737-.072-5.018-.197-4.322-2.625-6.74-6.979-6.94-1.28-.058-1.688-.072-5.018-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'groups'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 mb-1">
                {activeTab === 'groups' ? (
                  <Users className="w-6 h-6" />
                ) : (
                  <Users className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs font-medium">Groups</span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'friends'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 mb-1">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Friends</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 mb-1">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


