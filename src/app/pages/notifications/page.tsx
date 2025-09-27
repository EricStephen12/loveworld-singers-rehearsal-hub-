'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, BellOff, Settings, Clock, CheckCircle, AlertCircle, Info, X, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  category: 'rehearsal' | 'announcement' | 'reminder' | 'system'
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'rehearsal' | 'announcement' | 'reminder' | 'system'>('all')
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

  // Sample notifications data
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'Rehearsal Reminder',
        message: 'Praise Night rehearsal starts in 30 minutes at the main auditorium.',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        category: 'rehearsal',
        priority: 'high',
        actionUrl: '/pages/praise-night'
      },
      {
        id: '2',
        title: 'New Song Added',
        message: 'A new song "Amazing Grace" has been added to the repertoire.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        category: 'announcement',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Profile Update Required',
        message: 'Please complete your profile information to access all features.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        category: 'system',
        priority: 'medium',
        actionUrl: '/pages/profile'
      },
      {
        id: '4',
        title: 'Rehearsal Cancelled',
        message: 'Tonight\'s rehearsal has been cancelled due to weather conditions.',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
        category: 'rehearsal',
        priority: 'high'
      },
      {
        id: '5',
        title: 'Welcome to LoveWorld Singers!',
        message: 'Welcome to the LoveWorld Singers Rehearsal Hub. Start exploring!',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        read: true,
        category: 'system',
        priority: 'low'
      }
    ]
    
    setNotifications(sampleNotifications)
    setFilteredNotifications(sampleNotifications)
  }, [])

  // Filter notifications based on search and filter criteria
  useEffect(() => {
    let filtered = notifications

    // Filter by read status
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.read)
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

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setFilteredNotifications(filtered)
  }, [notifications, filterType, filterCategory, searchTerm])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
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

      {/* Notification Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-md mx-auto">
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
      <div className="px-4 py-6">
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
                    !notification.read ? 'ring-2 ring-purple-100' : ''
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
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
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
        </div>
      </div>

      {/* Bottom Navigation Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={(() => {
          const menuItems = getMenuItems()
          console.log('Menu items:', menuItems)
          return menuItems || []
        })()}
      />
    </div>
  )
}
