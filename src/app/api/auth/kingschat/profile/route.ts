import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    const accessToken = authorization.replace('Bearer ', '')
    console.log('🔄 Fetching user profile from KingsChat API...')

    // Real KingsChat API call to get user profile
    const profileResponse = await fetch('https://kingschat.online/api/v1/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('❌ Profile fetch failed:', profileResponse.status, errorText)
      
      let errorMessage = 'Failed to fetch user profile'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: profileResponse.status }
      )
    }

    const profileData = await profileResponse.json()
    console.log('✅ Profile fetch successful')
    return NextResponse.json(profileData)
  } catch (error: any) {
    console.error('❌ Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}