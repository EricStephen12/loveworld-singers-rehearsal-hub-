// Viewport Height Fix for Mobile Browsers
export class ViewportHeightFix {
  private static isInitialized = false

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return

    this.isInitialized = true

    // Set CSS custom property for viewport height
    const setVH = () => {
      // Use visualViewport if available (more accurate on mobile)
      const height = window.visualViewport?.height || window.innerHeight
      const vh = height * 0.01

      document.documentElement.style.setProperty('--vh', `${vh}px`)

      // Also set the actual height on html and body
      document.documentElement.style.height = `${height}px`
      document.body.style.height = `${height}px`

      console.log('📱 Viewport height updated:', {
        innerHeight: window.innerHeight,
        visualHeight: window.visualViewport?.height,
        actualHeight: height,
        vh: vh
      })
    }

    // Set initial value immediately
    setVH()

    // Set again after a short delay (for iOS)
    setTimeout(setVH, 100)
    setTimeout(setVH, 300)

    // Update on resize
    window.addEventListener('resize', () => {
      setVH()
      // Double-check after resize completes
      setTimeout(setVH, 100)
    })

    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100)
      setTimeout(setVH, 300)
      setTimeout(setVH, 500)
    })

    // Update when visual viewport changes (mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        setVH()
        setTimeout(setVH, 100)
      })

      window.visualViewport.addEventListener('scroll', () => {
        setVH()
      })
    }

    // Handle app resume from background (iOS Safari issue)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('📱 App resumed from background - fixing viewport')
        setTimeout(setVH, 100)
        setTimeout(setVH, 300)
        setTimeout(setVH, 500)
      }
    })

    // Handle page focus (when switching back to tab)
    window.addEventListener('focus', () => {
      console.log('📱 Page focused - fixing viewport')
      setTimeout(setVH, 100)
      setTimeout(setVH, 300)
    })

    // Handle page show (when page becomes visible)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('📱 Page restored from cache - fixing viewport')
        setTimeout(setVH, 100)
        setTimeout(setVH, 300)
      }
    })

    // Handle scroll events (for mobile browsers that hide/show address bar)
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(setVH, 150)
    }, { passive: true })

    console.log('📱 Viewport height fix initialized')
  }

  static getViewportHeight() {
    if (typeof window === 'undefined') return '100vh'
    
    // Use visual viewport if available
    if (window.visualViewport) {
      return `${window.visualViewport.height}px`
    }
    
    // Use CSS custom property
    const vh = document.documentElement.style.getPropertyValue('--vh')
    if (vh) {
      return `calc(var(--vh, 1vh) * 100)`
    }
    
    return '100vh'
  }

  static forceRefresh() {
    if (typeof window === 'undefined') return
    
    console.log('📱 Force refreshing viewport height')
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    
    // Also trigger a resize event to update any components listening
    window.dispatchEvent(new Event('resize'))
  }
}



