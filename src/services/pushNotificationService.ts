// Push Notification Service for LoveWorld Singers App
// Handles browser push notifications, service worker registration, and notification management

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
}

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

class PushNotificationService {
  private static instance: PushNotificationService
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private isSupported: boolean = false

  constructor() {
    // Only check for browser APIs on client-side
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    } else {
      this.isSupported = false
    }
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // Check if push notifications are supported
  public isNotificationSupported(): boolean {
    return this.isSupported
  }

  // Get current notification permission status
  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return { granted: false, denied: false, default: false }
    }

    const permission = Notification.permission
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      console.log('Notification permission:', permission)
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Register service worker for push notifications
  public async registerServiceWorker(): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-notifications.js')
      this.serviceWorkerRegistration = registration
      console.log('Service worker registered for notifications:', registration)
      return true
    } catch (error) {
      console.error('Error registering service worker:', error)
      return false
    }
  }

  // Send a local notification
  public async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    const permission = this.getPermissionStatus()
    if (!permission.granted) {
      console.warn('Notification permission not granted')
      return false
    }

    try {
      let notification: Notification

      if (this.serviceWorkerRegistration) {
        // Use service worker for better control
        await this.serviceWorkerRegistration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/icon-192x192.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false,
          silent: payload.silent || false
        })
      } else {
        // Fallback to direct notification
        notification = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false,
          silent: payload.silent || false
        })

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      console.log('Notification sent:', payload.title)
      return true
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  // Send rehearsal reminder notification
  public async sendRehearsalReminder(rehearsalData: {
    title: string
    time: string
    location: string
    minutesUntil: number
  }): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🎵 Rehearsal Reminder',
      body: `${rehearsalData.title} starts in ${rehearsalData.minutesUntil} minutes at ${rehearsalData.location}`,
      icon: '/icon-192x192.png',
      tag: 'rehearsal-reminder',
      data: {
        type: 'rehearsal',
        url: '/pages/program',
        rehearsalData
      },
      requireInteraction: true
    }

    return this.sendNotification(payload)
  }

  // Send announcement notification
  public async sendAnnouncement(announcement: {
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
  }): Promise<boolean> {
    const priorityEmoji = {
      low: '📢',
      medium: '📢',
      high: '🚨'
    }

    const payload: NotificationPayload = {
      title: `${priorityEmoji[announcement.priority]} ${announcement.title}`,
      body: announcement.message,
      icon: '/icon-192x192.png',
      tag: 'announcement',
      data: {
        type: 'announcement',
        priority: announcement.priority
      },
      requireInteraction: announcement.priority === 'high'
    }

    return this.sendNotification(payload)
  }

  // Send system notification
  public async sendSystemNotification(message: {
    title: string
    body: string
    type: 'info' | 'success' | 'warning' | 'error'
  }): Promise<boolean> {
    const typeEmoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }

    const payload: NotificationPayload = {
      title: `${typeEmoji[message.type]} ${message.title}`,
      body: message.body,
      icon: '/icon-192x192.png',
      tag: 'system',
      data: {
        type: 'system',
        notificationType: message.type
      },
      requireInteraction: message.type === 'error',
      silent: message.type === 'info'
    }

    return this.sendNotification(payload)
  }

  // Schedule a notification for later
  public scheduleNotification(payload: NotificationPayload, delay: number): void {
    setTimeout(() => {
      this.sendNotification(payload)
    }, delay)
  }

  // Clear all notifications
  public async clearAllNotifications(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }

  // Get notification settings from localStorage
  public getNotificationSettings(): {
    enabled: boolean
    sound: boolean
    vibration: boolean
    rehearsalReminders: boolean
    announcements: boolean
    systemUpdates: boolean
  } {
    const defaultSettings = {
      enabled: true,
      sound: true,
      vibration: true,
      rehearsalReminders: true,
      announcements: true,
      systemUpdates: true
    }

    try {
      const stored = localStorage.getItem('notification-settings')
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch (error) {
      console.error('Error loading notification settings:', error)
      return defaultSettings
    }
  }

  // Save notification settings to localStorage
  public saveNotificationSettings(settings: any): void {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving notification settings:', error)
    }
  }

  // Initialize the notification service
  public async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported')
      return false
    }

    try {
      // Register service worker
      await this.registerServiceWorker()

      // Request permission if not already granted
      const permission = this.getPermissionStatus()
      if (!permission.granted && !permission.denied) {
        await this.requestPermission()
      }

      // Set up notification click handler
      if (this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration.addEventListener('notificationclick', (event: any) => {
          event.notification.close()

          if (event.action === 'view' && event.notification.data?.url) {
            // Open the app to the specific URL
            event.waitUntil(
              (self as any).clients.openWindow(event.notification.data.url)
            )
          }
        })
      }

      console.log('Push notification service initialized')
      return true
    } catch (error) {
      console.error('Error initializing push notification service:', error)
      return false
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance()

// Helper functions for common notification types
export const sendRehearsalReminder = (rehearsalData: any) => 
  pushNotificationService.sendRehearsalReminder(rehearsalData)

export const sendAnnouncement = (announcement: any) => 
  pushNotificationService.sendAnnouncement(announcement)

export const sendSystemNotification = (message: any) => 
  pushNotificationService.sendSystemNotification(message)

export const requestNotificationPermission = () => 
  pushNotificationService.requestPermission()

export const initializeNotifications = () => 
  pushNotificationService.initialize()

