'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Bell, BellOff, Settings, Clock, CheckCircle, AlertCircle, Info, X, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useRealtimeNotifications, NotificationData, useNotificationActions } from '@/hooks/useRealtimeNotifications'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin'>('all')

  // Use real-time notifications hook
  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useRealtimeNotifications()
  const { user, profile } = useAuth()
  const { createNotificationForAll, createNotificationForGroup } = useNotificationActions()
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    rehearsalReminders: true,
    announcements: true,
    systemUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  // Filter notifications based on search and filter criteria (client-side filtering for real-time data)
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications

    // Filter by read status
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.is_read)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(n => n.category === filterCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by created_at (newest first)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [notifications, filterType, filterCategory, searchTerm])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      default:
        return 'border-l-gray-300'
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

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Header */}
      <ScreenHeader
        title="Notifications"
        onMenuClick={() => setIsMenuOpen(true)}
        rightButtons={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        }
      />

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto">
        {/* Notification Settings Panel */}
        {showSettings && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-2xl mx-auto px-3 sm:px-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications on your device</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, pushEnabled: !prev.pushEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.pushEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Rehearsal Reminders</p>
                    <p className="text-sm text-gray-500">Get notified before rehearsals</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, rehearsalReminders: !prev.rehearsalReminders }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.rehearsalReminders ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.rehearsalReminders ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sound</p>
                    <p className="text-sm text-gray-500">Play sound for notifications</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings.soundEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-2xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="rehearsal">Rehearsal</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
                <option value="system">System</option>
                <option value="admin">Admin</option>
              </select>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Admin Create Notification Section */}
          {profile?.role === 'admin' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Send Notification</h3>
              <div className="space-y-3">
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
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Send to All Users
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
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send to Specific Group
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                    ? 'No notifications match your filters.' 
                    : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border-l-4 ${getPriorityColor(notification.priority)} shadow-sm hover:shadow-md transition-shadow ${
                    !notification.is_read ? 'ring-2 ring-purple-100' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(notification.created_at)}</span>
                            </div>
                            <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </div> {/* End Scrollable Content */}
        </div>
      </div>

      {/* Bottom Navigation Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={(() => {
          const menuItems = getMenuItems()
          return menuItems || []
        })()}
      />
    </div>
  )
}


// notifications page 