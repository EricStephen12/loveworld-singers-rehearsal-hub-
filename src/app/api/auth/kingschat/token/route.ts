import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d'
    const KINGSCHAT_CLIENT_SECRET = process.env.KINGSCHAT_CLIENT_SECRET
    const REDIRECT_URI = redirect_uri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/kingschat/callback`

    console.log('🔄 Exchanging authorization code for token...')
    console.log('📋 Client ID:', KINGSCHAT_CLIENT_ID)
    console.log('🔑 Code:', code.substring(0, 10) + '...')
    console.log('🔗 Redirect URI:', REDIRECT_URI)

    if (!KINGSCHAT_CLIENT_SECRET || KINGSCHAT_CLIENT_SECRET === 'your_kingschat_client_secret_here') {
      console.error('❌ KingsChat Client Secret not configured')
      return NextResponse.json(
        { error: 'KingsChat OAuth is not properly configured. Please add KINGSCHAT_CLIENT_SECRET to your environment variables.' },
        { status: 500 }
      )
    }

    // Handle mock secret for testing
    if (KINGSCHAT_CLIENT_SECRET === 'mock_secret_for_testing') {
      console.log('🧪 Using mock KingsChat OAuth for testing')
      
      // Return mock tokens for testing
      const mockTokens = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0XzEyMzQ1IiwibmFtZSI6IktpbmdzQ2hhdCBVc2VyIiwiZW1haWwiOiJ0ZXN0QGtpbmdzY2hhdC5jb20iLCJmaXJzdE5hbWUiOiJLaW5nc0NoYXQiLCJsYXN0TmFtZSI6IlVzZXIiLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        token_type: 'Bearer'
      }
      
      return NextResponse.json(mockTokens)
    }

    try {
      // Real KingsChat OAuth token exchange
      const tokenResponse = await fetch('https://kingschat.online/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KINGSCHAT_CLIENT_ID,
          client_secret: KINGSCHAT_CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI
        })
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('❌ Token exchange failed:', tokenResponse.status, errorText)
        
        // Try to parse error as JSON
        let errorMessage = 'Failed to exchange authorization code'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error_description || errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: tokenResponse.status }
        )
      }

      const tokenData = await tokenResponse.json()
      console.log('✅ Token exchange successful')
      console.log('🔐 Token type:', tokenData.token_type)
      console.log('⏰ Expires in:', tokenData.expires_in, 'seconds')
      
      return NextResponse.json(tokenData)
    } catch (fetchError: any) {
      console.error('❌ Network error during token exchange:', fetchError)
      return NextResponse.json(
        { error: `Network error: ${fetchError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Token exchange error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}