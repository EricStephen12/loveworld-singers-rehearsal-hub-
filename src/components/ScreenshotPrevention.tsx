'use client'

import { useEffect } from 'react'

export default function ScreenshotPrevention() {
  useEffect(() => {
    // Prevent screenshots and screen recording
    const preventScreenshot = () => {
      // Add CSS to prevent screenshots
      const style = document.createElement('style')
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Prevent text selection */
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Allow text selection in input fields */
        input, textarea, [contenteditable] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `
      document.head.appendChild(style)

      // Prevent right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        return false
      }

      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      const preventDevTools = (e: KeyboardEvent) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U') ||
          (e.ctrlKey && e.key === 'S') ||
          (e.ctrlKey && e.key === 'A') ||
          (e.ctrlKey && e.key === 'P')
        ) {
          e.preventDefault()
          return false
        }
      }

      // Prevent drag and drop
      const preventDragDrop = (e: DragEvent) => {
        e.preventDefault()
        return false
      }

      // Add event listeners
      document.addEventListener('contextmenu', preventContextMenu)
      document.addEventListener('keydown', preventDevTools)
      document.addEventListener('dragstart', preventDragDrop)
      document.addEventListener('drop', preventDragDrop)

      // Prevent print
      window.addEventListener('beforeprint', (e) => {
        e.preventDefault()
        alert('Printing is not allowed')
        return false
      })

      // Clear console periodically
      const clearConsole = () => {
        if (typeof console !== 'undefined') {
          console.clear()
        }
      }

      // Clear console every 2 seconds
      const consoleInterval = setInterval(clearConsole, 2000)

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu)
        document.removeEventListener('keydown', preventDevTools)
        document.removeEventListener('dragstart', preventDragDrop)
        document.removeEventListener('drop', preventDragDrop)
        clearInterval(consoleInterval)
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
      }
    }

    const cleanup = preventScreenshot()

    return cleanup
  }, [])

  // Add meta tags for additional security
  useEffect(() => {
    // Add security meta tags
    const securityMeta = document.createElement('meta')
    securityMeta.setAttribute('name', 'referrer')
    securityMeta.setAttribute('content', 'no-referrer')
    document.head.appendChild(securityMeta)

    // Prevent iframe embedding
    const frameMeta = document.createElement('meta')
    frameMeta.setAttribute('http-equiv', 'X-Frame-Options')
    frameMeta.setAttribute('content', 'DENY')
    document.head.appendChild(frameMeta)

    return () => {
      if (securityMeta.parentNode) {
        securityMeta.parentNode.removeChild(securityMeta)
      }
      if (frameMeta.parentNode) {
        frameMeta.parentNode.removeChild(frameMeta)
      }
    }
  }, [])

  return null
}


