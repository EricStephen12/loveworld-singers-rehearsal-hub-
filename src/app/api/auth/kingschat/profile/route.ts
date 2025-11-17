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
    console.log('🔄 Fetching user profile with token...')

    // Use the access token as the KingsChat ID (just like in signup)
    // The token itself becomes the unique identifier
    const kingschatId = accessToken
    
    const profile = {
      userId: kingschatId,
      id: kingschatId,
      email: 'user@kingschat.com', // This can be filled later if needed
      firstName: 'KingsChat',
      lastName: 'User',
      name: 'KingsChat User',
      profilePicture: '/kingschat.jpeg',
      verified: true
    }

    console.log('✅ Profile created using token as KingsChat ID')
    return NextResponse.json(profile)

    /* 
    // Uncomment this when you have the correct KingsChat API endpoints
    const profileResponse = await fetch('https://kingschat.online/api/v1/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('❌ Profile fetch failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 400 }
      )
    }

    const profileData = await profileResponse.json()
    console.log('✅ Profile fetch successful')
    return NextResponse.json(profileData)
    */
  } catch (error: any) {
    console.error('❌ Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}