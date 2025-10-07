// Viewport Height Fix for Mobile Browsers
export class ViewportHeightFix {
  private static isInitialized = false

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return
    
    this.isInitialized = true
    
    // Set CSS custom property for viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // Set initial value
    setVH()

    // Update on resize
    window.addEventListener('resize', setVH)
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100)
    })

    // Update when visual viewport changes (mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH)
    }

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
}



