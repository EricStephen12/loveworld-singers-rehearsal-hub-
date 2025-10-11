'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Clock, X, Search, Music, Calendar, Megaphone, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useRealtimeNotifications, NotificationData, useNotificationActions } from '@/hooks/useRealtimeNotifications'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Use real-time notifications hook
  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useRealtimeNotifications()
  const { user, profile } = useAuth()
  const { createNotificationForAll, createNotificationForGroup } = useNotificationActions()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  // Filter notifications based on search
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by created_at (newest first)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [notifications, searchTerm])

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const groups: { [key: string]: NotificationData[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    filteredNotifications.forEach(notif => {
      const notifDate = new Date(notif.created_at)
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

      if (notifDay.getTime() === today.getTime()) {
        groups.today.push(notif)
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif)
      } else if (notifDate >= weekAgo) {
        groups.thisWeek.push(notif)
      } else {
        groups.older.push(notif)
      }
    })

    return groups
  }, [filteredNotifications])

  // Get category icon and color
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'rehearsal':
        return {
          icon: <Calendar className="w-5 h-5" />,
          gradient: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-50',
          text: 'text-purple-700'
        }
      case 'song':
        return {
          icon: <Music className="w-5 h-5" />,
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700'
        }
      case 'praise_night':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          gradient: 'from-yellow-500 to-orange-500',
          bg: 'bg-yellow-50',
          text: 'text-yellow-700'
        }
      case 'announcement':
        return {
          icon: <Megaphone className="w-5 h-5" />,
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          text: 'text-green-700'
        }
      case 'admin':
        return {
          icon: <Bell className="w-5 h-5" />,
          gradient: 'from-red-500 to-pink-500',
          bg: 'bg-red-50',
          text: 'text-red-700'
        }
      default:
        return {
          icon: <Bell className="w-5 h-5" />,
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          text: 'text-gray-700'
        }
    }
  }



  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const timestampDate = new Date(timestamp)
    const diff = now.getTime() - timestampDate.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Header */}
      <ScreenHeader
        title="Notifications"
        onMenuClick={() => setIsMenuOpen(true)}
        rightButtons={
          unreadCount > 0 ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          ) : null
        }
      />

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Content */}
        <div className="pb-20">
          {/* Search Bar */}
          <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Actions */}
          {unreadCount > 0 && (
            <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
              <button
                onClick={markAllAsRead}
                className="w-full py-2.5 bg-white text-purple-600 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors shadow-sm"
              >
                ✓ Mark all {unreadCount} as read
              </button>
            </div>
          )}

          {/* Admin Create Notification Section */}
          {profile?.role === 'admin' && (
            <div className="mx-4 mt-4 mb-3 p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Admin Controls
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={async () => {
                    const title = prompt('Enter notification title:')
                    const message = prompt('Enter notification message:')
                    if (title && message) {
                      const result = await createNotificationForAll({
                        title,
                        message,
                        type: 'info',
                        category: 'admin',
                        priority: 'medium'
                      })
                      if (result.success) {
                        alert('Notification sent to all users!')
                      } else {
                        alert('Failed to send notification: ' + result.error)
                      }
                    }
                  }}
                  className="bg-white text-purple-600 py-2.5 px-3 rounded-xl hover:bg-purple-50 transition-colors font-medium text-sm shadow-md"
                >
                  📢 All Users
                </button>
                <button
                  onClick={async () => {
                    const title = prompt('Enter notification title:')
                    const message = prompt('Enter notification message:')
                    const group = prompt('Enter group name:')
                    if (title && message && group) {
                      const result = await createNotificationForGroup({
                        title,
                        message,
                        groupName: group,
                        type: 'info',
                        category: 'admin',
                        priority: 'medium'
                      })
                      if (result.success) {
                        alert(`Notification sent to ${group} group!`)
                      } else {
                        alert('Failed to send notification: ' + result.error)
                      }
                    }
                  }}
                  className="bg-white text-blue-600 py-2.5 px-3 rounded-xl hover:bg-blue-50 transition-colors font-medium text-sm shadow-md"
                >
                  👥 Group
                </button>
              </div>
              <button
                onClick={async () => {
                  if (confirm('⚠️ Delete ALL notifications? This cannot be undone!')) {
                    try {
                      // Delete all notifications from Firebase
                      const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
                      const allNotifications = await FirebaseDatabaseService.getCollection('notifications')

                      for (const notif of allNotifications) {
                        await FirebaseDatabaseService.deleteDocument('notifications', notif.id)
                      }

                      alert('✅ All notifications deleted!')
                      window.location.reload()
                    } catch (error) {
                      console.error('Error deleting notifications:', error)
                      alert('❌ Failed to delete notifications')
                    }
                  }
                }}
                className="w-full bg-red-500 text-white py-2 px-3 rounded-xl hover:bg-red-600 transition-colors font-medium text-sm shadow-md"
              >
                🗑️ Delete All Notifications
              </button>
            </div>
          )}

          {/* Notifications List - Grouped by Date */}
          <div className="px-4 pb-6">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? 'No notifications match your search.'
                    : 'You\'re all caught up! 🎉'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Today */}
                {groupedNotifications.today.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Today</h3>
                    <div className="space-y-2">
                      {groupedNotifications.today.map((notification) => {
                        const categoryStyle = getCategoryStyle(notification.category)
                        return (
                          <div
                            key={notification.id}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 ${
                              !notification.is_read ? 'ring-2 ring-purple-200' : ''
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                  <div className="text-white">
                                    {categoryStyle.icon}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className={`font-bold text-gray-900 text-sm leading-tight ${!notification.is_read ? 'text-purple-900' : ''}`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.is_read && (
                                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                                    )}
                                  </div>

                                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(notification.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                >
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Yesterday</h3>
                    <div className="space-y-2">
                      {groupedNotifications.yesterday.map((notification) => {
                        const categoryStyle = getCategoryStyle(notification.category)
                        return (
                          <div
                            key={notification.id}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 ${
                              !notification.is_read ? 'ring-2 ring-purple-200' : ''
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                  <div className="text-white">{categoryStyle.icon}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{notification.title}</h4>
                                    {!notification.is_read && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full flex-shrink-0 mt-1" />}
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{formatTimestamp(notification.created_at)}</span>
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }} className="p-2 hover:bg-gray-100 rounded-full">
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* This Week */}
                {groupedNotifications.thisWeek.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">This Week</h3>
                    <div className="space-y-2">
                      {groupedNotifications.thisWeek.map((notification) => {
                        const categoryStyle = getCategoryStyle(notification.category)
                        return (
                          <div key={notification.id} onClick={() => !notification.is_read && markAsRead(notification.id)} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center flex-shrink-0`}>
                                  <div className="text-white">{categoryStyle.icon}</div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm mb-1">{notification.title}</h4>
                                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>
                                  <span className="text-xs text-gray-500">{formatTimestamp(notification.created_at)}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }} className="p-2 hover:bg-gray-100 rounded-full">
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Older */}
                {groupedNotifications.older.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Older</h3>
                    <div className="space-y-2 opacity-75">
                      {groupedNotifications.older.map((notification) => {
                        const categoryStyle = getCategoryStyle(notification.category)
                        return (
                          <div key={notification.id} className="bg-white rounded-2xl shadow-sm">
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center flex-shrink-0 opacity-60`}>
                                  <div className="text-white">{categoryStyle.icon}</div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-700 text-sm mb-1">{notification.title}</h4>
                                  <p className="text-gray-500 text-xs line-clamp-1">{notification.message}</p>
                                </div>
                                <button onClick={() => deleteNotification(notification.id)} className="p-2 hover:bg-gray-100 rounded-full">
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={(() => {
          const menuItems = getMenuItems(undefined, undefined)
          return menuItems || []
        })()}
      />
    </div>
  )
}


// notifications page 