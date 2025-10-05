import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChatService } from '@/lib/chat-service'
import type { Conversation, Message, ChatContact, TypingIndicator } from '@/types/supabase'

export function useChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const subscriptionsRef = useRef<{ [key: string]: any }>({})

  // Load initial data
  useEffect(() => {
    if (user?.uid) {
      loadInitialData()
      updateOnlineStatus(true)
    }

    return () => {
      if (user?.uid) {
        updateOnlineStatus(false)
        cleanupSubscriptions()
      }
    }
  }, [user?.uid])

  const loadInitialData = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      setError(null)

      const [conversationsData, contactsData] = await Promise.all([
        ChatService.getUserConversations(user.uid),
        ChatService.getContacts(user.uid)
      ])

      setConversations(conversationsData)
      setContacts(contactsData)
    } catch (err) {
      console.error('Error loading chat data:', err)
      setError('Failed to load chat data')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user?.uid) return
    await ChatService.updateOnlineStatus(user.uid, isOnline)
  }

  const cleanupSubscriptions = () => {
    Object.values(subscriptionsRef.current).forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    })
    subscriptionsRef.current = {}
  }

  // Subscribe to conversation messages
  const subscribeToMessages = useCallback((conversationId: string) => {
    if (!user?.uid || subscriptionsRef.current[`messages:${conversationId}`]) return

    const subscription = ChatService.subscribeToMessages(conversationId, (newMessage: Message) => {
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })

      // Mark as read if it's not from current user
      if (newMessage.sender_id !== user.uid) {
        ChatService.markMessagesAsRead(conversationId, user.uid)
      }
    })

    subscriptionsRef.current[`messages:${conversationId}`] = subscription
  }, [user?.uid])

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback((conversationId: string) => {
    if (!user?.uid || subscriptionsRef.current[`typing:${conversationId}`]) return

    const subscription = ChatService.subscribeToTypingIndicators(conversationId, (indicators: TypingIndicator[]) => {
      setTypingIndicators(indicators.filter(indicator => indicator.user_id !== user.uid))
    })

    subscriptionsRef.current[`typing:${conversationId}`] = subscription
  }, [user?.uid])

  // Subscribe to online status changes
  const subscribeToOnlineStatus = useCallback((userIds: string[]) => {
    if (!user?.uid || subscriptionsRef.current['online_status']) return

    const subscription = ChatService.subscribeToOnlineStatus(userIds, (statuses) => {
      // Update contacts with new online status
      setContacts(prev => prev.map(contact => {
        const status = statuses.find(s => s.user_id === contact.user.id)
        if (status) {
          return {
            ...contact,
            is_online: status.is_online,
            last_seen: status.last_seen
          }
        }
        return contact
      }))
    })

    subscriptionsRef.current['online_status'] = subscription
  }, [user?.uid])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messagesData = await ChatService.getConversationMessages(conversationId)
      setMessages(messagesData)
      
      // Subscribe to real-time updates
      subscribeToMessages(conversationId)
      subscribeToTyping(conversationId)
      
      // Mark messages as read
      if (user?.uid) {
        await ChatService.markMessagesAsRead(conversationId, user.uid)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    }
  }, [user?.uid, subscribeToMessages, subscribeToTyping])

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'voice' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    isDisappearing = false,
    expiresInMinutes = 10
  ) => {
    if (!user?.uid) return null

    try {
      const message = await ChatService.sendMessage(
        conversationId,
        user.uid,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        isDisappearing,
        expiresInMinutes
      )

      if (message) {
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, message])
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, last_message: message, updated_at: new Date().toISOString() }
            : conv
        ))
      }

      return message
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
      return null
    }
  }, [user?.uid])

  // Set typing indicator
  const setTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user?.uid) return

    try {
      await ChatService.setTypingIndicator(conversationId, user.uid, isTyping)
    } catch (err) {
      console.error('Error setting typing indicator:', err)
    }
  }, [user?.uid])

  // Add message reaction
  const addReaction = useCallback(async (messageId: string, reactionType: string) => {
    if (!user?.uid) return

    try {
      await ChatService.addMessageReaction(messageId, user.uid, reactionType)
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []).filter(r => r.user_id !== user.uid),
                {
                  id: `${messageId}-${user.uid}`,
                  message_id: messageId,
                  user_id: user.uid,
                  reaction_type: reactionType as any,
                  created_at: new Date().toISOString(),
                  user: {
                    id: user.uid,
                    first_name: (user as any).user_metadata?.first_name || '',
                    last_name: (user as any).user_metadata?.last_name || '',
                    email: user.email || ''
                  } as any
                }
              ]
            }
          : msg
      ))
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }, [user?.uid])

  // Remove message reaction
  const removeReaction = useCallback(async (messageId: string) => {
    if (!user?.uid) return

    try {
      await ChatService.removeMessageReaction(messageId, user.uid)
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              reactions: (msg.reactions || []).filter(r => r.user_id !== user.uid)
            }
          : msg
      ))
    } catch (err) {
      console.error('Error removing reaction:', err)
    }
  }, [user?.uid])

  // Get or create conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string) => {
    if (!user?.uid) return null

    try {
      const conversation = await ChatService.getOrCreateConversation(user.uid, otherUserId)
      
      if (conversation) {
        // Update conversations list
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === conversation.id)
          if (exists) {
            return prev
          }
          return [conversation, ...prev]
        })
      }

      return conversation
    } catch (err) {
      console.error('Error getting/creating conversation:', err)
      setError('Failed to start conversation')
      return null
    }
  }, [user?.uid])

  // Start chat with a contact
  const startChat = useCallback(async (contact: ChatContact) => {
    const conversation = await getOrCreateConversation(contact.user.id)
    if (conversation) {
      await loadMessages(conversation.id)
    }
    return conversation
  }, [getOrCreateConversation, loadMessages])

  // Refresh data
  const refresh = useCallback(() => {
    if (user?.uid) {
      loadInitialData()
    }
  }, [user?.uid])

  return {
    // State
    conversations,
    contacts,
    messages,
    typingIndicators,
    isLoading,
    error,
    
    // Actions
    loadMessages,
    sendMessage,
    setTypingIndicator,
    addReaction,
    removeReaction,
    getOrCreateConversation,
    startChat,
    refresh,
    updateOnlineStatus,
    
    // Subscriptions
    subscribeToMessages,
    subscribeToTyping,
    subscribeToOnlineStatus
  }
}
