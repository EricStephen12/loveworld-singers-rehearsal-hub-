# Video & Voice Calls Setup Guide

## 🎥 Quick Setup (5 Minutes)

Your chat app is **almost ready** for video and voice calls! The WebRTC service is fully implemented, you just need to enable the signaling mechanism.

## What's Already Done ✅

- ✅ WebRTC service (complete)
- ✅ Call signaling service (complete)
- ✅ Call UI (complete)
- ✅ Audio/video controls (complete)
- ✅ Call buttons in chat (complete)

## What You Need to Do 🔧

### Option 1: Use Firebase Realtime Database (Recommended - Easiest)

**Step 1: Enable Firebase Realtime Database**
1. Go to Firebase Console
2. Select your project
3. Click "Realtime Database" in left menu
4. Click "Create Database"
5. Choose location (closest to your users)
6. Start in "test mode" for now

**Step 2: Update Security Rules**
```json
{
  "rules": {
    "call_signals": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$signalId": {
        ".validate": "newData.hasChildren(['from', 'to', 'type', 'timestamp'])"
      }
    }
  }
}
```

**Step 3: That's It!**
The app will automatically use Firebase for signaling. No code changes needed!

### Option 2: Use Socket.IO (More Complex)

If you prefer real-time WebSocket connections:

**Step 1: Install Socket.IO**
```bash
npm install socket.io-client
```

**Step 2: Create Socket Service**
```typescript
// src/lib/socket-signaling-service.ts
import { io, Socket } from 'socket.io-client'

export class SocketSignalingService {
  private socket: Socket | null = null

  connect() {
    this.socket = io('YOUR_SOCKET_SERVER_URL')
    
    this.socket.on('call-offer', (data) => {
      // Handle incoming offer
    })
    
    this.socket.on('call-answer', (data) => {
      // Handle answer
    })
    
    this.socket.on('ice-candidate', (data) => {
      // Handle ICE candidate
    })
  }

  sendOffer(targetUserId: string, offer: any) {
    this.socket?.emit('call-offer', { to: targetUserId, offer })
  }

  // ... other methods
}
```

**Step 3: Update WebRTC Service**
Replace Firebase signaling with Socket.IO in `webrtc-service.ts`

## Testing Video Calls

### Prerequisites:
1. ✅ Two devices or browsers
2. ✅ Both users logged in
3. ✅ Camera/microphone permissions granted
4. ✅ Stable internet connection

### Test Steps:

**User A (Caller):**
1. Open chat with User B
2. Click video call icon (📹)
3. Grant camera/microphone permissions
4. Wait for User B to answer

**User B (Receiver):**
1. See incoming call notification
2. Click "Answer"
3. Grant camera/microphone permissions
4. Video call starts!

### Expected Behavior:
- ✅ User A sees their own video (local)
- ✅ User B sees their own video (local)
- ✅ Both users see each other's video (remote)
- ✅ Audio works both ways
- ✅ Mute/unmute works
- ✅ Video on/off works
- ✅ End call works

## Troubleshooting

### Issue: "Call not connecting"
**Solution:**
1. Check Firebase Realtime Database is enabled
2. Verify both users are online
3. Check browser console for errors
4. Ensure permissions granted

### Issue: "No video/audio"
**Solution:**
1. Check camera/microphone permissions
2. Try different browser (Chrome recommended)
3. Check device settings
4. Restart browser

### Issue: "Call drops immediately"
**Solution:**
1. Check internet connection
2. Verify STUN/TURN servers working
3. Check firewall settings
4. Try on different network

### Issue: "Can't hear other person"
**Solution:**
1. Check volume settings
2. Verify microphone not muted
3. Check audio output device
4. Test with different headphones

## Advanced Configuration

### Custom STUN/TURN Servers

For better connectivity, especially behind firewalls:

```typescript
// In webrtc-service.ts
private defaultConfig: CallConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ],
  audio: true,
  video: true
}
```

### Video Quality Settings

Adjust video quality based on network:

```typescript
// High quality (good network)
const constraints = {
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  }
}

// Low quality (poor network)
const constraints = {
  audio: true,
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 }
  }
}
```

### Screen Sharing

Add screen sharing capability:

```typescript
async startScreenShare(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    })
    
    // Replace video track with screen share
    const videoTrack = stream.getVideoTracks()[0]
    const sender = this.callState.peerConnection
      ?.getSenders()
      .find(s => s.track?.kind === 'video')
    
    if (sender) {
      await sender.replaceTrack(videoTrack)
    }
    
    return true
  } catch (error) {
    console.error('Screen share error:', error)
    return false
  }
}
```

## Performance Optimization

### Reduce Bandwidth Usage:
```typescript
// Lower video bitrate
const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
if (sender) {
  const parameters = sender.getParameters()
  parameters.encodings[0].maxBitrate = 500000 // 500 kbps
  await sender.setParameters(parameters)
}
```

### Adaptive Bitrate:
```typescript
// Monitor connection quality
peerConnection.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      const packetsLost = report.packetsLost
      const packetsReceived = report.packetsReceived
      const lossRate = packetsLost / (packetsLost + packetsReceived)
      
      if (lossRate > 0.1) {
        // Reduce quality
        console.log('High packet loss, reducing quality')
      }
    }
  })
})
```

## Security Best Practices

### 1. Encrypt Signaling
Use HTTPS for all signaling communication

### 2. Validate Users
Ensure only authenticated users can make calls

### 3. Rate Limiting
Prevent spam calling:
```typescript
const callAttempts = new Map<string, number>()

function canMakeCall(userId: string): boolean {
  const attempts = callAttempts.get(userId) || 0
  if (attempts > 5) {
    return false // Max 5 calls per minute
  }
  callAttempts.set(userId, attempts + 1)
  setTimeout(() => callAttempts.delete(userId), 60000)
  return true
}
```

### 4. End-to-End Encryption
For sensitive calls, implement E2EE:
```typescript
// Use insertable streams API
const sender = peerConnection.getSenders()[0]
const senderStreams = sender.createEncodedStreams()

senderStreams.readable
  .pipeThrough(new TransformStream({
    transform: encryptFrame
  }))
  .pipeTo(senderStreams.writable)
```

## Production Checklist

Before going live:

- [ ] Firebase Realtime Database enabled
- [ ] Security rules configured
- [ ] TURN server set up (for firewall traversal)
- [ ] Error handling implemented
- [ ] Call quality monitoring
- [ ] User feedback mechanism
- [ ] Analytics tracking
- [ ] Load testing completed
- [ ] Mobile testing done
- [ ] Cross-browser testing done

## Cost Estimation

### Firebase Realtime Database:
- **Free Tier**: 1GB storage, 10GB/month download
- **Typical Usage**: ~1KB per signal
- **Estimated Cost**: Free for most apps

### TURN Server (if needed):
- **Free Options**: Coturn (self-hosted)
- **Paid Options**: Twilio, Xirsys ($10-50/month)
- **When Needed**: ~10% of calls (behind strict firewalls)

## Support Resources

- **WebRTC Docs**: https://webrtc.org/getting-started/overview
- **Firebase Docs**: https://firebase.google.com/docs/database
- **MDN WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Stack Overflow**: Tag `webrtc`

## Quick Test Script

Run this in browser console to test WebRTC support:

```javascript
// Test WebRTC support
console.log('WebRTC Support:', {
  RTCPeerConnection: !!window.RTCPeerConnection,
  getUserMedia: !!navigator.mediaDevices?.getUserMedia,
  getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia
})

// Test camera access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Camera/microphone access granted')
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => console.error('❌ Camera/microphone access denied:', err))

// Test STUN server
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
})
pc.createDataChannel('test')
pc.createOffer().then(offer => pc.setLocalDescription(offer))
pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('✅ STUN server working:', e.candidate.candidate)
  }
}
```

---

## 🎉 You're Ready!

Once Firebase Realtime Database is enabled, your video and voice calls will work perfectly. The entire infrastructure is already built and waiting!

**Estimated Setup Time**: 5 minutes
**Difficulty**: Easy
**Result**: Fully functional video/voice calls

Good luck! 🚀
