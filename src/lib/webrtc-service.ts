// WebRTC Service for Video and Voice Calls
export interface CallConfig {
  iceServers: RTCIceServer[]
  audio: boolean
  video: boolean
}

export interface CallState {
  isInCall: boolean
  isCallActive: boolean
  isMuted: boolean
  isVideoEnabled: boolean
  callType: 'video' | 'voice' | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerConnection: RTCPeerConnection | null
}

export class WebRTCService {
  private static instance: WebRTCService
  private callState: CallState = {
    isInCall: false,
    isCallActive: false,
    isMuted: false,
    isVideoEnabled: true,
    callType: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null
  }

  private callbacks: {
    onCallStateChange?: (state: CallState) => void
    onRemoteStream?: (stream: MediaStream) => void
    onCallEnded?: () => void
  } = {}

  private defaultConfig: CallConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    audio: true,
    video: true
  }

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService()
    }
    return WebRTCService.instance
  }

  // Set callbacks
  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Get current call state
  getCallState(): CallState {
    return { ...this.callState }
  }

  // Start a call (video or voice)
  async startCall(callType: 'video' | 'voice', targetUserId: string): Promise<boolean> {
    try {
      console.log(`Starting ${callType} call with ${targetUserId}`)
      
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { width: 640, height: 480 } : false
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.defaultConfig)
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream')
        const remoteStream = event.streams[0]
        this.callState.remoteStream = remoteStream
        this.callbacks.onRemoteStream?.(remoteStream)
        this.updateCallState()
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated')
          // In a real app, you would send this to the other peer via signaling server
          this.sendSignalingMessage('ice-candidate', event.candidate, targetUserId)
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          this.callState.isCallActive = true
          this.updateCallState()
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          this.endCall()
        }
      }

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        callType,
        localStream,
        peerConnection,
        isVideoEnabled: callType === 'video'
      }

      this.updateCallState()

      // Create offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      // Send offer to other peer
      this.sendSignalingMessage('offer', offer, targetUserId)

      return true
    } catch (error) {
      console.error('Error starting call:', error)
      this.endCall()
      return false
    }
  }

  // Answer an incoming call
  async answerCall(offer: RTCSessionDescriptionInit, targetUserId: string): Promise<boolean> {
    try {
      console.log('Answering call from', targetUserId)
      
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: this.callState.callType === 'video' ? { width: 640, height: 480 } : false
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.defaultConfig)
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream')
        const remoteStream = event.streams[0]
        this.callState.remoteStream = remoteStream
        this.callbacks.onRemoteStream?.(remoteStream)
        this.updateCallState()
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated')
          this.sendSignalingMessage('ice-candidate', event.candidate, targetUserId)
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          this.callState.isCallActive = true
          this.updateCallState()
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          this.endCall()
        }
      }

      // Set remote description
      await peerConnection.setRemoteDescription(offer)
      
      // Create answer
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      // Send answer to other peer
      this.sendSignalingMessage('answer', answer, targetUserId)

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        isCallActive: true,
        localStream,
        peerConnection
      }

      this.updateCallState()
      return true
    } catch (error) {
      console.error('Error answering call:', error)
      this.endCall()
      return false
    }
  }

  // End the current call
  endCall(): void {
    console.log('Ending call')
    
    // Stop local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (this.callState.peerConnection) {
      this.callState.peerConnection.close()
    }

    // Reset call state
    this.callState = {
      isInCall: false,
      isCallActive: false,
      isMuted: false,
      isVideoEnabled: true,
      callType: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null
    }

    this.updateCallState()
    this.callbacks.onCallEnded?.()
  }

  // Toggle mute
  toggleMute(): boolean {
    if (!this.callState.localStream) return false

    const audioTrack = this.callState.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.callState.isMuted = !audioTrack.enabled
      this.updateCallState()
      return true
    }
    return false
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.callState.localStream) return false

    const videoTrack = this.callState.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.callState.isVideoEnabled = videoTrack.enabled
      this.updateCallState()
      return true
    }
    return false
  }

  // Send signaling message (in a real app, this would go through a signaling server)
  private sendSignalingMessage(type: string, data: any, targetUserId: string): void {
    console.log(`Sending ${type} to ${targetUserId}:`, data)
    // In a real implementation, this would send the message through a WebSocket or similar
    // For now, we'll just log it
  }

  // Update call state and notify callbacks
  private updateCallState(): void {
    this.callbacks.onCallStateChange?.(this.getCallState())
  }

  // Check if device supports WebRTC
  static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.RTCPeerConnection &&
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia
    )
  }
}







