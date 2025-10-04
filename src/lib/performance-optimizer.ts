// Performance Optimizer - Fix PWA Slowness
export class PerformanceOptimizer {
  // Disable heavy real-time subscriptions
  static disableHeavyFeatures() {
    // Disable real-time notifications
    if (typeof window !== 'undefined') {
      localStorage.setItem('disable_realtime', 'true')
      localStorage.setItem('disable_chat', 'true')
      localStorage.setItem('disable_notifications', 'true')
    }
  }

  // Enable only essential features
  static enableEssentialFeatures() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enable_caching', 'true')
      localStorage.setItem('enable_offline', 'true')
    }
  }

  // Clear heavy caches
  static clearHeavyCaches() {
    if (typeof window !== 'undefined') {
      // Clear old caches
      localStorage.removeItem('realtime_data')
      localStorage.removeItem('chat_data')
      localStorage.removeItem('notification_data')
    }
  }

  // Optimize for speed
  static optimizeForSpeed() {
    this.disableHeavyFeatures()
    this.enableEssentialFeatures()
    this.clearHeavyCaches()
    console.log('🚀 Performance optimized for speed!')
  }
}

