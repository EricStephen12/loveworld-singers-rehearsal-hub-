import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { client_id, redirect_uri, scope } = await request.json()
    
    // Generate state for security
    const state = Math.random().toString(36).substring(7)
    
    // Store session data
    const sessionId = Math.random().toString(36).substring(7)
    
    // Create proxy URL that will serve the OAuth page
    const proxyUrl = `/api/auth/kingschat/oauth-proxy?session=${sessionId}&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${state}`
    
    return NextResponse.json({
      success: true,
      proxyUrl,
      sessionId,
      state
    })
  } catch (error) {
    console.error('OAuth start error:', error)
    return NextResponse.json({ success: false, error: 'Failed to start OAuth' }, { status: 500 })
  }
}