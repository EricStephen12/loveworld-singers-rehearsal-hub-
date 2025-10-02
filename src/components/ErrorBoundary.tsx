'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎵</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>LWSRHP</h1>
          <p style={{ margin: '0 0 20px 0', opacity: 0.9, maxWidth: '300px' }}>
            Something went wrong. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'white',
              color: '#8B5CF6',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
