import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get server time (UTC)
    const serverTime = new Date()
    
    return NextResponse.json({
      serverTime: serverTime.toISOString(),
      timestamp: serverTime.getTime(),
      timezone: 'UTC'
    })
  } catch (error) {
    console.error('Error getting server time:', error)
    return NextResponse.json(
      { error: 'Failed to get server time' },
      { status: 500 }
    )
  }
}
